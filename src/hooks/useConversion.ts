import { useState, useCallback } from 'react';
import { FileItem, ProgressCallback, ResizeSettings } from '../types';
import { ConversionService } from '../services/conversionService';

export function useConversion() {
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const convertAllFiles = useCallback(
    async (
      files: FileItem[],
      quality: number,
      globalResizeSettings: ResizeSettings,
      updateFile: (id: string | number, updates: Partial<FileItem>) => void
    ): Promise<void> => {
      setIsConverting(true);

      const filesToConvert = files.filter(f => f.status === 'pending');

      // Update status to converting for all pending files
      filesToConvert.forEach(file => {
        updateFile(file.id, { progress: 0, status: 'converting' });
      });

      for (const file of filesToConvert) {
        try {
          const updateProgress: ProgressCallback = (progress: number) => {
            updateFile(file.id, { progress, status: 'converting' });
          };

          const convertedBlob = await ConversionService.convertToWebP(
            file,
            quality,
            globalResizeSettings,
            updateProgress,
            updateFile
          );

          if (convertedBlob) {
            const convertedPreview = URL.createObjectURL(convertedBlob);

            updateFile(file.id, {
              status: 'converted',
              progress: 100,
              convertedBlob,
              convertedSize: convertedBlob.size,
              convertedPreview,
            });
          } else {
            updateFile(file.id, { status: 'error', progress: 0 });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error('Conversion error for file:', file.name, errorMessage);
          updateFile(file.id, { status: 'error', progress: 0 });
        }

        // Small delay between conversions
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      setIsConverting(false);
    },
    []
  );

  return {
    isConverting,
    convertAllFiles,
  };
}