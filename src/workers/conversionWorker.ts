// Web Worker for handling heavy conversion operations
// This worker runs in a separate thread to prevent blocking the main UI

interface ConversionMessage {
  type: 'CONVERT_IMAGE' | 'CONVERT_VIDEO' | 'VALIDATE_FILE';
  payload: any;
  id: string;
}

interface ConversionResponse {
  type:
    | 'CONVERSION_SUCCESS'
    | 'CONVERSION_ERROR'
    | 'VALIDATION_SUCCESS'
    | 'VALIDATION_ERROR';
  payload: any;
  id: string;
}

// File validation in worker
const validateFileInWorker = (
  file: File
): { isValid: boolean; error?: string; warning?: string } => {
  const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

  if (
    file.size >
    (file.type.startsWith('video/') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE)
  ) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum file size is ${file.type.startsWith('video/') ? '500MB' : '50MB'}.`,
    };
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (isImage) {
    const supportedFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
    ];
    if (!supportedFormats.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: `File "${file.name}" is not a supported image format.`,
      };
    }
  } else if (isVideo) {
    const supportedFormats = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/mov',
      'video/quicktime',
      'video/3gpp',
    ];
    const fileName = file.name.toLowerCase();

    // Check file extension for additional support
    const hasVideoExtension = fileName.match(/\.(mp4|webm|ogg|mov|3gp)$/);

    if (
      !supportedFormats.includes(file.type.toLowerCase()) &&
      !hasVideoExtension
    ) {
      return {
        isValid: false,
        error: `File "${file.name}" is not a supported video format.`,
      };
    }
  } else {
    return {
      isValid: false,
      error: `File "${file.name}" is not a supported format.`,
    };
  }

  return { isValid: true };
};

// Image processing utilities for worker
const processImageInWorker = async (
  imageData: ImageData,
  quality: number
): Promise<Blob> => {
  // Create an OffscreenCanvas for processing
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context in worker');
  }

  // Draw the image data to canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert to WebP blob
  const blob = await canvas.convertToBlob({
    type: 'image/webp',
    quality: quality / 100,
  });

  return blob;
};

// Message handler
self.onmessage = async (e: MessageEvent<ConversionMessage>) => {
  const { type, payload, id } = e.data;

  try {
    switch (type) {
      case 'VALIDATE_FILE':
        const validation = validateFileInWorker(payload.file);
        const response: ConversionResponse = {
          type: validation.isValid ? 'VALIDATION_SUCCESS' : 'VALIDATION_ERROR',
          payload: validation,
          id,
        };
        self.postMessage(response);
        break;

      case 'CONVERT_IMAGE':
        // For image conversion, we'll handle the heavy lifting here
        // This is a simplified version - in practice, you'd need to pass the image data
        const imageBlob = await processImageInWorker(
          payload.imageData,
          payload.quality
        );
        const imageResponse: ConversionResponse = {
          type: 'CONVERSION_SUCCESS',
          payload: { blob: imageBlob },
          id,
        };
        self.postMessage(imageResponse);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const errorResponse: ConversionResponse = {
      type: type === 'VALIDATE_FILE' ? 'VALIDATION_ERROR' : 'CONVERSION_ERROR',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      id,
    };
    self.postMessage(errorResponse);
  }
};

// Export types for use in main thread
export type { ConversionMessage, ConversionResponse };
