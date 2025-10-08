import { useState, useCallback, useEffect } from 'react';
import { FileItem, ResizeSettings, VideoSettings } from '../types';
import { ConversionService } from '../services/conversionService';

export function useFileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const addFiles = useCallback(async (newFiles: File[]): Promise<void> => {
    const validFiles: FileItem[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      const validation = ConversionService.validateFile(file);
      if (validation.isValid) {
        try {
          const fileItem = await ConversionService.createFileItem(file);
          validFiles.push(fileItem);

          // Log warning for debugging, but don't show intrusive dialogs
          if (validation.warning) {
            console.warn(validation.warning);
            // The file is added anyway - we'll show any issues during conversion
          }
        } catch (error) {
          console.warn('Error creating file item:', error);
          errors.push(`Failed to process file: ${file.name}`);
        }
      } else if (validation.error) {
        errors.push(validation.error);
        console.warn(validation.error);
        // Don't show alert - just log and add to errors array for potential future display
      }
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
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
    files.forEach((file: FileItem) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      if (file.convertedPreview) {
        URL.revokeObjectURL(file.convertedPreview);
      }
    });
    setFiles([]);
  }, [files]);

  const updateFile = useCallback((id: string | number, updates: Partial<FileItem>): void => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

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

  const applyGlobalResizeToAll = useCallback((globalResizeSettings: ResizeSettings) => {
    setFiles(prev =>
      prev.map(f => ({ ...f, resizeSettings: { ...globalResizeSettings } }))
    );
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      files.forEach((file: FileItem) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
        if (file.convertedPreview) {
          URL.revokeObjectURL(file.convertedPreview);
        }
      });
    };
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