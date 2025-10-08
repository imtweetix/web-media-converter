import { FileItem, ProgressCallback, ResizeSettings, VideoSettings } from '../types';
import { VideoConversionService } from './videoConversionService';

export class ConversionService {
  private static calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    resizeSettings: ResizeSettings
  ) {
    if (!resizeSettings.enabled) {
      return { width: originalWidth, height: originalHeight };
    }

    const { maxWidth, maxHeight } = resizeSettings;

    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const scaleX = maxWidth / originalWidth;
    const scaleY = maxHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    return {
      width: Math.round(originalWidth * scale),
      height: Math.round(originalHeight * scale),
    };
  }

  static async convertToWebP(
    file: FileItem,
    quality: number,
    globalResizeSettings: ResizeSettings,
    updateProgress: ProgressCallback,
    updateFile: (id: string | number, updates: Partial<FileItem>) => void
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      updateProgress(10);

      img.onload = () => {
        try {
          updateProgress(40);

          const MAX_CANVAS_DIMENSION = 16384;
          if (
            img.width > MAX_CANVAS_DIMENSION ||
            img.height > MAX_CANVAS_DIMENSION
          ) {
            reject(
              new Error(
                `Image dimensions too large. Maximum ${MAX_CANVAS_DIMENSION}x${MAX_CANVAS_DIMENSION} pixels.`
              )
            );
            return;
          }

          const originalDimensions = { width: img.width, height: img.height };

          const effectiveResizeSettings = file.resizeSettings?.enabled
            ? file.resizeSettings
            : globalResizeSettings;

          const finalDimensions = this.calculateResizeDimensions(
            img.width,
            img.height,
            effectiveResizeSettings
          );

          updateFile(file.id, { originalDimensions, finalDimensions });

          canvas.width = finalDimensions.width;
          canvas.height = finalDimensions.height;

          updateProgress(60);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(
            img,
            0,
            0,
            finalDimensions.width,
            finalDimensions.height
          );

          updateProgress(80);

          const hasTransparency =
            file.file.type === 'image/png' ||
            file.file.name.toLowerCase().endsWith('.png');
          const webpQuality =
            hasTransparency && quality > 90 ? 1.0 : quality / 100;

          canvas.toBlob(
            blob => {
              if (blob) {
                updateProgress(100);
                resolve(blob);
              } else {
                reject(new Error('Failed to create WebP blob'));
              }
            },
            'image/webp',
            webpQuality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.crossOrigin = 'anonymous';

      if (file.file) {
        const reader = new FileReader();
        reader.onload = e => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          }
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file.file);
      } else {
        img.src = file.preview;
      }
    });
  }

  static validateFile(file: File): { isValid: boolean; error?: string; warning?: string } {
    // Check if it's a video file first
    if (file.type.startsWith('video/')) {
      return VideoConversionService.validateVideoFile(file);
    }

    // Original image validation
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for images

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File "${file.name}" is too large. Maximum file size is 50MB for images.`,
      };
    }

    const isImage = file.type.startsWith('image/');
    const isSupported = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
    ].includes(file.type.toLowerCase());

    if (!isImage || !isSupported) {
      return {
        isValid: false,
        error: `File "${file.name}" is not a supported image format.`,
      };
    }

    return { isValid: true };
  }

  static async createFileItem(file: File): Promise<FileItem> {
    const isVideo = file.type.startsWith('video/');
    let preview = URL.createObjectURL(file);

    // For videos, try to generate a thumbnail
    if (isVideo) {
      try {
        preview = await VideoConversionService.getVideoThumbnail(file);
      } catch (error) {
        console.warn('Could not generate video thumbnail:', error);
        // Keep the video file URL as fallback
      }
    }

    return {
      id: crypto.randomUUID?.() || Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      preview,
      status: 'pending',
      progress: 0,
      convertedBlob: null,
      convertedSize: null,
      convertedPreview: null,
      resizeSettings: { enabled: false, maxWidth: 2048, maxHeight: 2048 },
      videoSettings: { resolution: 'default', crf: 28, fps: 'default', audioEnabled: true },
      isVideo,
    };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getSavingsPercentage(original: number, converted: number): number {
    if (!original || !converted) return 0;
    return Math.round(((original - converted) / original) * 100);
  }

  static sanitizeFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/^\.+/, '');
  }
}
