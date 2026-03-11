import { describe, it, expect } from 'vitest';
import { ConversionService } from '@/services/conversionService';

/**
 * Helper to create a File object with a given name, MIME type, and size.
 * Content is irrelevant — validation only checks type, size, and name.
 */
function makeFile(name: string, type: string, sizeBytes: number): File {
  const buffer = new ArrayBuffer(Math.min(sizeBytes, 64));
  const blob = new Blob([buffer], { type });
  // Override size via Object.defineProperty since Blob size is read-only
  const file = new File([blob], name, { type });
  if (file.size !== sizeBytes) {
    Object.defineProperty(file, 'size', { value: sizeBytes });
  }
  return file;
}

// ─── Image validation via ConversionService.validateFile ───

describe('ConversionService.validateFile — images', () => {
  it('accepts JPEG files', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 2_500_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts PNG files', () => {
    const file = makeFile('image.png', 'image/png', 3_000_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('accepts GIF files', () => {
    const file = makeFile('animation.gif', 'image/gif', 3_600_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('accepts BMP files', () => {
    const file = makeFile('bitmap.bmp', 'image/bmp', 1_000_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('accepts WebP files', () => {
    const file = makeFile('already.webp', 'image/webp', 500_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('rejects TIFF files (unsupported image format)', () => {
    const file = makeFile('scan.tiff', 'image/tiff', 10_000_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not a supported image format');
  });

  it('rejects images exceeding 50MB', () => {
    const file = makeFile('huge.jpg', 'image/jpeg', 51 * 1024 * 1024);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('too large');
    expect(result.error).toContain('50MB');
  });

  it('accepts images at exactly 50MB', () => {
    const file = makeFile('big.jpg', 'image/jpeg', 50 * 1024 * 1024);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('rejects non-image, non-video files', () => {
    const file = makeFile('document.pdf', 'application/pdf', 500_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not a supported image format');
  });
});

// ─── Video delegation via ConversionService.validateFile ───

describe('ConversionService.validateFile — video delegation', () => {
  it('delegates MP4 to video validation and accepts', () => {
    const file = makeFile('video.mp4', 'video/mp4', 18_000_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('delegates MOV to video validation and accepts', () => {
    const file = makeFile('clip.mov', 'video/quicktime', 2_200_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('delegates OGG to video validation and accepts', () => {
    const file = makeFile('movie.ogg', 'video/ogg', 13_300_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(true);
  });

  it('delegates AVI to video validation and rejects', () => {
    const file = makeFile('old.avi', 'video/avi', 2_300_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not supported');
  });

  it('delegates WMV to video validation and rejects', () => {
    const file = makeFile('legacy.wmv', 'video/x-ms-wmv', 9_300_000);
    const result = ConversionService.validateFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not supported');
  });
});
