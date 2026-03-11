import { describe, it, expect } from 'vitest';
import { VideoConversionService } from '@/services/videoConversionService';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buffer = new ArrayBuffer(Math.min(sizeBytes, 64));
  const blob = new Blob([buffer], { type });
  const file = new File([blob], name, { type });
  if (file.size !== sizeBytes) {
    Object.defineProperty(file, 'size', { value: sizeBytes });
  }
  return file;
}

// ─── Supported formats ───

describe('VideoConversionService.validateVideoFile — supported formats', () => {
  it('accepts MP4 files', () => {
    const file = makeFile('video.mp4', 'video/mp4', 18_000_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts WebM files', () => {
    const file = makeFile('video.webm', 'video/webm', 5_000_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(true);
  });

  it('accepts OGG files', () => {
    const file = makeFile('video.ogg', 'video/ogg', 13_300_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(true);
  });

  it('accepts MOV files (video/quicktime)', () => {
    const file = makeFile('clip.mov', 'video/quicktime', 2_200_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(true);
  });

  it('accepts 3GP files (video/3gpp)', () => {
    const file = makeFile('mobile.3gp', 'video/3gpp', 1_000_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(true);
  });
});

// ─── Unsupported formats ───

describe('VideoConversionService.validateVideoFile — unsupported formats', () => {
  it('rejects AVI files by extension', () => {
    const file = makeFile('old.avi', 'video/avi', 2_300_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not supported');
    expect(result.error).toContain('MP4');
  });

  it('rejects AVI files by MIME type (x-msvideo)', () => {
    const file = makeFile('old.avi', 'video/x-msvideo', 2_300_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(false);
  });

  it('rejects WMV files by extension', () => {
    const file = makeFile('legacy.wmv', 'video/x-ms-wmv', 9_300_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not supported');
  });

  it('rejects WMV files even with generic video type', () => {
    const file = makeFile('legacy.wmv', 'video/wmv', 9_300_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(false);
  });

  it('error message suggests supported formats', () => {
    const file = makeFile('old.avi', 'video/avi', 2_300_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.error).toContain('MP4');
    expect(result.error).toContain('WebM');
    expect(result.error).toContain('MOV');
  });
});

// ─── Size limits ───

describe('VideoConversionService.validateVideoFile — size limits', () => {
  it('rejects videos exceeding 500MB', () => {
    const file = makeFile('huge.mp4', 'video/mp4', 501 * 1024 * 1024);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('too large');
    expect(result.error).toContain('500MB');
  });

  it('accepts videos at exactly 500MB', () => {
    const file = makeFile('big.mp4', 'video/mp4', 500 * 1024 * 1024);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(true);
  });

  it('accepts small videos', () => {
    const file = makeFile('tiny.mp4', 'video/mp4', 1024);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(true);
  });
});

// ─── Edge cases ───

describe('VideoConversionService.validateVideoFile — edge cases', () => {
  it('rejects non-video files without video extension', () => {
    const file = makeFile('document.txt', 'text/plain', 1000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not a supported video format');
  });

  it('error message includes the filename', () => {
    const file = makeFile('my-video.avi', 'video/avi', 5_000_000);
    const result = VideoConversionService.validateVideoFile(file);
    expect(result.error).toContain('my-video.avi');
  });
});
