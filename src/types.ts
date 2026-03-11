export interface ResizeSettings {
  enabled: boolean;
  maxWidth: number;
  maxHeight: number;
}

export interface VideoResolution {
  width: number;
  height: number;
  label: string;
}

export interface VideoSettings {
  resolution:
    | 'default'
    | 'custom'
    | '320x240'
    | '640x480'
    | '1280x720'
    | '1920x1080'
    | '2560x1440'
    | '3840x2160';
  customWidth?: number;
  customHeight?: number;
  crf: number; // Constant Rate Factor (0-53)
  fps: 'default' | '12' | '15' | '24' | '25' | '30' | '48' | '50' | '60';
  audioEnabled: boolean;
  enabled?: boolean; // For individual file overrides
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
  videoSettings?: VideoSettings;
  quality?: number; // Individual quality setting for images (10-100)
  originalDimensions?: { width: number; height: number };
  finalDimensions?: { width: number; height: number };
  duration?: number; // video duration in seconds
  isVideo: boolean;
  errorMessage?: string; // Error message for failed conversions
}

export interface ConversionSettings {
  quality: number;
  resize: ResizeSettings;
  video: VideoSettings;
}

export interface ZipEntry {
  header: Uint8Array;
  data: Uint8Array;
  fileName: Uint8Array;
  offset: number;
}

export type ProgressCallback = (progress: number) => void;

export type ConversionStatus = 'pending' | 'converting' | 'converted' | 'error';
