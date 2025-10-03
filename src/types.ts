export interface ResizeSettings {
  enabled: boolean;
  maxWidth: number;
  maxHeight: number;
}

export interface FileItem {
  id: string | number;
  file: File;
  name: string;
  size: number;
  preview: string;
  status: 'pending' | 'converting' | 'converted' | 'error';
  progress: number;
  convertedBlob: Blob | null;
  convertedSize: number | null;
  convertedPreview: string | null;
  resizeSettings?: ResizeSettings;
  originalDimensions?: { width: number; height: number };
  finalDimensions?: { width: number; height: number };
}

export interface ConversionSettings {
  quality: number;
  resize: ResizeSettings;
}

export interface ZipEntry {
  header: Uint8Array;
  data: Uint8Array;
  fileName: Uint8Array;
  offset: number;
}

export type ProgressCallback = (progress: number) => void;

export type ConversionStatus = 'pending' | 'converting' | 'converted' | 'error';
