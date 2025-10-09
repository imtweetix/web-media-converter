import { useCallback, useEffect, useRef, useState } from 'react';
import { ConversionService } from '../services/conversionService';
import { FileItem, ResizeSettings, VideoSettings } from '../types';

export function useFileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addFiles = useCallback(async (newFiles: File[]): Promise<void> => {
    // Cancel any ongoing file processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const errors: string[] = [];

    try {
      // Process files in parallel for better performance
      const filePromises = newFiles.map(
        async (file): Promise<FileItem | null> => {
          if (abortController.signal.aborted) return null;

          const validation = ConversionService.validateFile(file);
          if (validation.isValid) {
            try {
              const fileItem = await ConversionService.createFileItem(file);

              // Log warning for debugging, but don't show intrusive dialogs
              if (validation.warning) {
                console.warn(validation.warning);
              }

              return fileItem;
            } catch (error) {
              console.warn('Error creating file item:', error);
              errors.push(`Failed to process file: ${file.name}`);
              return null;
            }
          } else if (validation.error) {
            errors.push(validation.error);
            console.warn(validation.error);
            return null;
          }

          return null; // Fallback return
        }
      );

      const results = await Promise.all(filePromises);
      const processedFiles = results.filter(
        (file): file is FileItem => file !== null
      );

      if (!abortController.signal.aborted && processedFiles.length > 0) {
        setFiles(prev => [...prev, ...processedFiles]);
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('Error processing files:', error);
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  const removeFile = useCallback((id: string | number): void => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      if (fileToRemove?.convertedPreview) {
        URL.revokeObjectURL(fileToRemove.convertedPreview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAllFiles = useCallback((): void => {
    // Cancel any ongoing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clean up all blob URLs immediately
    files.forEach((file: FileItem) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      if (file.convertedPreview) {
        URL.revokeObjectURL(file.convertedPreview);
      }
      // Clean up converted blobs
      if (file.convertedBlob) {
        file.convertedBlob = null;
      }
    });
    setFiles([]);
  }, [files]);

  const updateFile = useCallback(
    (id: string | number, updates: Partial<FileItem>): void => {
      setFiles(prev =>
        prev.map(f => {
          if (f.id === id) {
            // Clean up old blob URLs when updating
            if (
              updates.convertedBlob &&
              f.convertedBlob &&
              f.convertedBlob !== updates.convertedBlob
            ) {
              // The old blob will be garbage collected automatically
            }
            return { ...f, ...updates };
          }
          return f;
        })
      );
    },
    []
  );

  const updateFileResizeSettings = useCallback(
    (fileId: string | number, resizeSettings: ResizeSettings) => {
      updateFile(fileId, { resizeSettings });
    },
    [updateFile]
  );

  const updateFileVideoSettings = useCallback(
    (fileId: string | number, videoSettings: VideoSettings) => {
      updateFile(fileId, { videoSettings });
    },
    [updateFile]
  );

  const applyGlobalResizeToAll = useCallback(
    (globalResizeSettings: ResizeSettings) => {
      setFiles(prev =>
        prev.map(f => ({ ...f, resizeSettings: { ...globalResizeSettings } }))
      );
    },
    []
  );

  // Enhanced cleanup effect with memory monitoring
  useEffect(() => {
    const cleanup = () => {
      files.forEach((file: FileItem) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
        if (file.convertedPreview) {
          URL.revokeObjectURL(file.convertedPreview);
        }
      });

      // Cancel any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };

    return cleanup;
  }, [files]);

  // Memory pressure monitoring
  useEffect(() => {
    const handleMemoryPressure = () => {
      // Force garbage collection of blob URLs when memory is low
      files.forEach((file: FileItem) => {
        if (file.status === 'converted' && file.convertedPreview) {
          URL.revokeObjectURL(file.convertedPreview);
          file.convertedPreview = null;
        }
      });
    };

    // Listen for memory pressure (if supported)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        if (memInfo && memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.8) {
          handleMemoryPressure();
        }
      };

      const interval = setInterval(checkMemory, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [files]);

  return {
    files,
    addFiles,
    removeFile,
    clearAllFiles,
    updateFile,
    updateFileResizeSettings,
    updateFileVideoSettings,
    applyGlobalResizeToAll,
  };
}
