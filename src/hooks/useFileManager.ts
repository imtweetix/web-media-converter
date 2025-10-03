import { useState, useCallback, useEffect } from 'react';
import { FileItem, ResizeSettings } from '../types';
import { ConversionService } from '../services/conversionService';

export function useFileManager() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const addFiles = useCallback((newFiles: File[]): void => {
    const validFiles: FileItem[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      const validation = ConversionService.validateFile(file);
      if (validation.isValid) {
        validFiles.push(ConversionService.createFileItem(file));
      } else if (validation.error) {
        errors.push(validation.error);
        console.warn(validation.error);
        alert(validation.error);
      }
    });

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
    applyGlobalResizeToAll,
  };
}