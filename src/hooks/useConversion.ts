import { useState, useCallback } from 'react';
import { FileItem, ProgressCallback, ResizeSettings, VideoSettings } from '../types';
import { ConversionService } from '../services/conversionService';
import { VideoConversionService } from '../services/videoConversionService';

export function useConversion() {
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const convertAllFiles = useCallback(
    async (
      files: FileItem[],
      quality: number,
      globalResizeSettings: ResizeSettings,
      globalVideoSettings: VideoSettings,
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

          let convertedBlob: Blob;

          if (file.isVideo) {
            // Use video conversion
            const effectiveVideoSettings = file.videoSettings || globalVideoSettings;
            convertedBlob = await VideoConversionService.convertToWebM(
              file,
              effectiveVideoSettings,
              updateProgress,
              updateFile
            );
          } else {
            // Use image conversion with individual quality if set, otherwise global
            const effectiveQuality = file.quality !== undefined ? file.quality : quality;
            convertedBlob = await ConversionService.convertToWebP(
              file,
              effectiveQuality,
              globalResizeSettings,
              updateProgress,
              updateFile
            );
          }

          if (convertedBlob) {
            // For videos, don't create a preview from the blob since it's a video file
            // The FileItem component will show a placeholder for videos
            const convertedPreview = file.isVideo ? null : URL.createObjectURL(convertedBlob);

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

          // Set error message in the file object for display
          updateFile(file.id, {
            status: 'error',
            progress: 0,
            errorMessage: errorMessage
          });
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