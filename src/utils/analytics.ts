/**
 * Google Analytics utility functions for tracking user interactions
 * Provides type-safe event tracking for the Web Media Converter app
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetOrAction: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Generic event tracking function
 * @param eventName - Name of the event to track
 * @param parameters - Optional parameters to include with the event
 */
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

/**
 * Track successful file conversion
 * @param fileType - Type of file converted ('image' | 'video')
 * @param fileSize - Size of the original file in bytes
 * @param convertedSize - Size of the converted file in bytes (optional)
 */
export const trackConversion = (
  fileType: 'image' | 'video',
  fileSize: number,
  convertedSize?: number
): void => {
  const params: Record<string, unknown> = {
    file_type: fileType,
    file_size_mb: (fileSize / (1024 * 1024)).toFixed(2),
  };

  if (convertedSize) {
    params.converted_size_mb = (convertedSize / (1024 * 1024)).toFixed(2);
    params.compression_ratio = ((1 - convertedSize / fileSize) * 100).toFixed(
      1
    );
  }

  trackEvent('conversion_completed', params);
};

/**
 * Track file download
 * @param downloadType - Type of download ('single' | 'batch')
 * @param fileCount - Number of files downloaded
 */
export const trackDownload = (
  downloadType: 'single' | 'batch',
  fileCount: number
): void => {
  trackEvent('download', {
    download_type: downloadType,
    file_count: fileCount,
  });
};

/**
 * Track conversion errors
 * @param fileType - Type of file that failed ('image' | 'video')
 * @param errorMessage - Error message or description
 */
export const trackConversionError = (
  fileType: 'image' | 'video',
  errorMessage: string
): void => {
  trackEvent('conversion_error', {
    file_type: fileType,
    error_message: errorMessage,
  });
};

/**
 * Track quality setting changes
 * @param settingType - Type of setting ('image_quality' | 'video_quality' | 'resize' | 'video_settings')
 * @param value - New value of the setting
 */
export const trackSettingChange = (
  settingType: string,
  value: unknown
): void => {
  trackEvent('setting_change', {
    setting_type: settingType,
    value: value,
  });
};

/**
 * Track file uploads
 * @param fileCount - Number of files uploaded
 * @param uploadMethod - Method used to upload ('drag_drop' | 'file_picker')
 */
export const trackFileUpload = (
  fileCount: number,
  uploadMethod: 'drag_drop' | 'file_picker'
): void => {
  trackEvent('file_upload', {
    file_count: fileCount,
    upload_method: uploadMethod,
  });
};
