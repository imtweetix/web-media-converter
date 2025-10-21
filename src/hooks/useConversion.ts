import { useCallback, useState } from 'react';
import { ConversionService } from '../services/conversionService';
import { VideoConversionService } from '../services/videoConversionService';
import {
  FileItem,
  ProgressCallback,
  ResizeSettings,
  VideoSettings,
} from '../types';
import { trackConversion, trackConversionError } from '../utils/analytics';

// Retry mechanism for failed conversions
const convertWithRetry = async (
  convertFn: () => Promise<Blob>,
  maxRetries: number = 2
): Promise<Blob> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await convertFn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      console.log(`Retry attempt ${attempt} for conversion`);
    }
  }
  throw new Error('Max retries exceeded');
};

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
      // Dynamically adjust concurrent limit based on device capability
      const deviceCapability = navigator.hardwareConcurrency || 3;
      const CONCURRENT_LIMIT = Math.min(
        deviceCapability,
        4,
        filesToConvert.length
      ); // Process up to 4 files simultaneously on capable devices

      // Update status to converting for all pending files
      filesToConvert.forEach(file => {
        updateFile(file.id, { progress: 0, status: 'converting' });
      });

      // Process files in parallel batches
      const processBatch = async (batch: FileItem[]) => {
        return Promise.all(
          batch.map(async file => {
            try {
              const updateProgress: ProgressCallback = (progress: number) => {
                updateFile(file.id, { progress, status: 'converting' });
              };

              const convertFn = async () => {
                if (file.isVideo) {
                  // Use video conversion
                  const effectiveVideoSettings = file.videoSettings?.enabled
                    ? file.videoSettings
                    : globalVideoSettings;
                  return await VideoConversionService.convertToWebM(
                    file,
                    effectiveVideoSettings,
                    updateProgress,
                    updateFile
                  );
                } else {
                  // Use image conversion with individual quality if set, otherwise global
                  const effectiveQuality =
                    file.quality !== undefined ? file.quality : quality;
                  return await ConversionService.convertToWebP(
                    file,
                    effectiveQuality,
                    globalResizeSettings,
                    updateProgress,
                    updateFile
                  );
                }
              };

              const convertedBlob = await convertWithRetry(convertFn);

              if (convertedBlob) {
                // For images, create a preview from the blob
                // For videos, the preview is generated in the conversion service
                const updates: Partial<FileItem> = {
                  status: 'converted',
                  progress: 100,
                  convertedBlob,
                  convertedSize: convertedBlob.size,
                };

                // Only set convertedPreview for images (videos handle it in their service)
                if (!file.isVideo) {
                  updates.convertedPreview = URL.createObjectURL(convertedBlob);
                }

                updateFile(file.id, updates);

                // Track successful conversion
                trackConversion(
                  file.isVideo ? 'video' : 'image',
                  file.file.size,
                  convertedBlob.size
                );
              } else {
                updateFile(file.id, { status: 'error', progress: 0 });
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              console.error(
                'Conversion error for file:',
                file.name,
                errorMessage
              );

              updateFile(file.id, {
                status: 'error',
                progress: 0,
                errorMessage: errorMessage,
              });

              // Track conversion error
              trackConversionError(
                file.isVideo ? 'video' : 'image',
                errorMessage
              );
            }
          })
        );
      };

      // Process files in batches to control concurrency
      for (let i = 0; i < filesToConvert.length; i += CONCURRENT_LIMIT) {
        const batch = filesToConvert.slice(i, i + CONCURRENT_LIMIT);
        await processBatch(batch);

        // Small delay between batches to prevent overwhelming the browser
        if (i + CONCURRENT_LIMIT < filesToConvert.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
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
