import * as Sentry from "@sentry/react";
import { useCallback, useEffect, useState } from "react";
import { ConversionService } from "../services/conversionService";
import {
  FFmpegLoadState,
  onFFmpegLoadProgress,
  onFFmpegStateChange,
} from "../services/ffmpegLoader";
import { VideoConversionService } from "../services/videoConversionService";
import {
  FileItem,
  ProgressCallback,
  ResizeSettings,
  VideoSettings,
} from "../types";
import { trackConversion, trackConversionError } from "../utils/analytics";

// Retry mechanism for failed conversions
const convertWithRetry = async (
  convertFn: () => Promise<Blob>,
  maxRetries: number = 2,
): Promise<Blob> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await convertFn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      console.log(`Retry attempt ${attempt} for conversion`);
    }
  }
  throw new Error("Max retries exceeded");
};

export function useConversion() {
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [ffmpegState, setFfmpegState] = useState<FFmpegLoadState>("idle");
  const [ffmpegLoadProgress, setFfmpegLoadProgress] = useState<number>(0);

  useEffect(() => {
    const unsubState = onFFmpegStateChange(setFfmpegState);
    const unsubProgress = onFFmpegLoadProgress(setFfmpegLoadProgress);
    return () => {
      unsubState();
      unsubProgress();
    };
  }, []);

  const convertAllFiles = useCallback(
    async (
      files: FileItem[],
      quality: number,
      globalResizeSettings: ResizeSettings,
      globalVideoSettings: VideoSettings,
      updateFile: (id: string | number, updates: Partial<FileItem>) => void,
    ): Promise<void> => {
      setIsConverting(true);

      const filesToConvert = files.filter((f) => f.status === "pending");

      // Split into images and videos
      const imageFiles = filesToConvert.filter((f) => !f.isVideo);
      const videoFiles = filesToConvert.filter((f) => f.isVideo);

      // Update status to converting for all pending files
      filesToConvert.forEach((file) => {
        updateFile(file.id, { progress: 0, status: "converting" });
      });

      // Helper to convert a single file
      const convertSingleFile = async (file: FileItem) => {
        try {
          const updateProgress: ProgressCallback = (progress: number) => {
            updateFile(file.id, { progress, status: "converting" });
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
                updateFile,
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
                updateFile,
              );
            }
          };

          const convertedBlob = await convertWithRetry(convertFn);

          if (convertedBlob) {
            // For images, create a preview from the blob
            // For videos, the preview is generated in the conversion service
            const updates: Partial<FileItem> = {
              status: "converted",
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
              file.isVideo ? "video" : "image",
              file.file.size,
              convertedBlob.size,
            );
          } else {
            updateFile(file.id, { status: "error", progress: 0 });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Conversion error for file:", file.name, errorMessage);

          Sentry.captureException(error, {
            tags: {
              category: file.isVideo ? "video-conversion" : "image-conversion",
            },
            extra: {
              fileName: file.name,
              fileSize: file.file.size,
              fileType: file.file.type,
            },
          });

          updateFile(file.id, {
            status: "error",
            progress: 0,
            errorMessage: errorMessage,
          });

          // Track conversion error
          trackConversionError(file.isVideo ? "video" : "image", errorMessage);
        }
      };

      // Process images in parallel batches
      if (imageFiles.length > 0) {
        const deviceCapability = navigator.hardwareConcurrency || 3;
        const IMAGE_CONCURRENT_LIMIT = Math.min(
          deviceCapability,
          4,
          imageFiles.length,
        );

        for (let i = 0; i < imageFiles.length; i += IMAGE_CONCURRENT_LIMIT) {
          const batch = imageFiles.slice(i, i + IMAGE_CONCURRENT_LIMIT);
          await Promise.all(batch.map(convertSingleFile));

          // Small delay between batches to prevent overwhelming the browser
          if (i + IMAGE_CONCURRENT_LIMIT < imageFiles.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      }

      // Process videos sequentially (single ffmpeg WASM instance)
      for (const video of videoFiles) {
        await convertSingleFile(video);
      }

      setIsConverting(false);
    },
    [],
  );

  return {
    isConverting,
    convertAllFiles,
    ffmpegState,
    ffmpegLoadProgress,
  };
}
