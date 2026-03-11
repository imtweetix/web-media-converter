import { describe, it, expect } from 'vitest';
import { ConversionService } from '@/services/conversionService';
import {
  sanitizeFilename,
  calculateCRC32,
} from '@/utils/zipUtils';

// ─── formatFileSize ───

describe('ConversionService.formatFileSize', () => {
  it('returns "0 Bytes" for zero', () => {
    expect(ConversionService.formatFileSize(0)).toBe('0 Bytes');
  });

  it('formats bytes below 1KB', () => {
    expect(ConversionService.formatFileSize(512)).toBe('512 Bytes');
  });

  it('formats kilobytes', () => {
    expect(ConversionService.formatFileSize(1024)).toBe('1 KB');
    expect(ConversionService.formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(ConversionService.formatFileSize(1048576)).toBe('1 MB');
    expect(ConversionService.formatFileSize(2621440)).toBe('2.5 MB');
  });

  it('formats fractional KB correctly', () => {
    // 10240 bytes = 10 KB
    expect(ConversionService.formatFileSize(10240)).toBe('10 KB');
  });
});

// ─── getSavingsPercentage ───

describe('ConversionService.getSavingsPercentage', () => {
  it('calculates savings correctly', () => {
    expect(ConversionService.getSavingsPercentage(1000, 700)).toBe(30);
  });

  it('returns 0 when original is zero', () => {
    expect(ConversionService.getSavingsPercentage(0, 500)).toBe(0);
  });

  it('returns 0 when converted is zero', () => {
    expect(ConversionService.getSavingsPercentage(1000, 0)).toBe(0);
  });

  it('returns negative when file grows', () => {
    expect(ConversionService.getSavingsPercentage(500, 600)).toBe(-20);
  });

  it('returns 50 for halved size', () => {
    expect(ConversionService.getSavingsPercentage(2000, 1000)).toBe(50);
  });
});

// ─── sanitizeFilename (ConversionService) ───

describe('ConversionService.sanitizeFilename', () => {
  it('replaces special characters with underscores', () => {
    expect(ConversionService.sanitizeFilename('file<name>.jpg')).toBe(
      'file_name_.jpg'
    );
  });

  it('removes leading dots', () => {
    expect(ConversionService.sanitizeFilename('..hidden.png')).toBe(
      'hidden.png'
    );
  });

  it('leaves clean filenames unchanged', () => {
    expect(ConversionService.sanitizeFilename('my-photo_2024.jpg')).toBe(
      'my-photo_2024.jpg'
    );
  });

  it('handles all special characters', () => {
    expect(ConversionService.sanitizeFilename('a<b>c:d"e/f\\g|h?i*j')).toBe(
      'a_b_c_d_e_f_g_h_i_j'
    );
  });
});

// ─── sanitizeFilename (zipUtils) ───

describe('zipUtils.sanitizeFilename', () => {
  it('replaces special characters with underscores', () => {
    expect(sanitizeFilename('file:"test".webp')).toBe('file__test_.webp');
  });

  it('removes leading dots', () => {
    expect(sanitizeFilename('...config')).toBe('config');
  });

  it('leaves clean filenames unchanged', () => {
    expect(sanitizeFilename('converted-file.webp')).toBe(
      'converted-file.webp'
    );
  });
});

// ─── calculateCRC32 ───

describe('calculateCRC32', () => {
  it('returns 0x00000000 for empty input', () => {
    const data = new Uint8Array(0);
    expect(calculateCRC32(data)).toBe(0x00000000);
  });

  it('computes correct CRC32 for ASCII "123456789"', () => {
    // Known CRC32 test vector: "123456789" → 0xCBF43926
    const data = new TextEncoder().encode('123456789');
    expect(calculateCRC32(data)).toBe(0xcbf43926);
  });

  it('computes correct CRC32 for a single byte', () => {
    // CRC32 of [0x00] → 0xD202EF8D
    const data = new Uint8Array([0x00]);
    expect(calculateCRC32(data)).toBe(0xd202ef8d);
  });

  it('produces different CRC32 for different data', () => {
    const data1 = new TextEncoder().encode('hello');
    const data2 = new TextEncoder().encode('world');
    expect(calculateCRC32(data1)).not.toBe(calculateCRC32(data2));
  });

  it('produces consistent results for same input', () => {
    const data = new TextEncoder().encode('test data');
    expect(calculateCRC32(data)).toBe(calculateCRC32(data));
  });
});
