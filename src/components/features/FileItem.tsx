import {
  faArrowDownToBracket,
  faXmark,
} from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useMemo } from 'react';
import { ConversionService } from '../../services/conversionService';
import {
  FileItem as FileItemType,
  ResizeSettings,
  VideoSettings,
} from '../../types';
import { Input, ProgressBar, StatusBadge } from '../ui';

interface FileItemProps {
  file: FileItemType;
  globalResizeSettings: ResizeSettings;
  onRemove: (id: string | number) => void;
  onDownload: (file: FileItemType) => void;
  onUpdateResizeSettings: (
    fileId: string | number,
    settings: ResizeSettings
  ) => void;
  onUpdateVideoSettings: (
    fileId: string | number,
    settings: VideoSettings
  ) => void;
  onUpdateFile: (id: string | number, updates: Partial<FileItemType>) => void;
}

export const FileItem = React.memo(function FileItem({
  file,
  globalResizeSettings,
  onRemove,
  onDownload,
  onUpdateResizeSettings,
  onUpdateVideoSettings,
  onUpdateFile,
}: FileItemProps) {
  // Memoize utility functions
  const formatFileSize = useMemo(() => ConversionService.formatFileSize, []);
  const getSavingsPercentage = useMemo(
    () => ConversionService.getSavingsPercentage,
    []
  );

  // Memoize event handlers to prevent unnecessary re-renders
  const handleResizeToggle = useCallback(
    (enabled: boolean) => {
      const currentSettings = file.resizeSettings || globalResizeSettings;
      onUpdateResizeSettings(file.id, {
        ...currentSettings,
        enabled,
      });
    },
    [file.id, file.resizeSettings, globalResizeSettings, onUpdateResizeSettings]
  );

  const handleQualityChange = useCallback(
    (quality: number) => {
      onUpdateFile(file.id, { quality });
    },
    [file.id, onUpdateFile]
  );

  const handleResizeSettingChange = useCallback(
    (field: 'maxWidth' | 'maxHeight', value: number) => {
      const currentSettings = file.resizeSettings || globalResizeSettings;
      onUpdateResizeSettings(file.id, {
        ...currentSettings,
        [field]: value,
      });
    },
    [file.id, file.resizeSettings, globalResizeSettings, onUpdateResizeSettings]
  );

  const handleVideoToggle = useCallback(
    (enabled: boolean) => {
      if (!enabled) {
        // Reset to use global settings
        onUpdateVideoSettings(file.id, {
          resolution: 'default',
          crf: 28,
          fps: 'default',
          audioEnabled: true,
          enabled: false,
        });
      } else {
        // Enable custom settings with current global values
        onUpdateVideoSettings(file.id, {
          resolution: file.videoSettings?.resolution || 'default',
          crf: file.videoSettings?.crf || 28,
          fps: file.videoSettings?.fps || 'default',
          audioEnabled: file.videoSettings?.audioEnabled ?? true,
          enabled: true,
        });
      }
    },
    [file.id, file.videoSettings, onUpdateVideoSettings]
  );

  const handleVideoSettingChange = useCallback(
    (updates: Partial<VideoSettings>) => {
      const currentSettings = file.videoSettings || {
        resolution: 'default',
        crf: 28,
        fps: 'default',
        audioEnabled: true,
      };
      onUpdateVideoSettings(file.id, {
        ...currentSettings,
        ...updates,
        enabled: true,
      });
    },
    [file.id, file.videoSettings, onUpdateVideoSettings]
  );

  const handleRemove = useCallback(() => {
    onRemove(file.id);
  }, [file.id, onRemove]);

  const handleDownload = useCallback(() => {
    onDownload(file);
  }, [file, onDownload]);

  // Memoize computed values
  const fileSizeInfo = useMemo(
    () => ({
      original: formatFileSize(file.size),
      converted: file.convertedSize ? formatFileSize(file.convertedSize) : null,
      savings: file.convertedSize
        ? getSavingsPercentage(file.size, file.convertedSize)
        : 0,
    }),
    [file.size, file.convertedSize, formatFileSize, getSavingsPercentage]
  );

  const dimensionsInfo = useMemo(
    () => ({
      original: file.originalDimensions
        ? `${file.originalDimensions.width}×${file.originalDimensions.height}`
        : null,
      final: file.finalDimensions
        ? `${file.finalDimensions.width}×${file.finalDimensions.height}`
        : null,
    }),
    [file.originalDimensions, file.finalDimensions]
  );

  return (
    <div className='p-6'>
      <div className='flex items-start space-x-4'>
        {/* Preview Images */}
        <div className='flex space-x-4'>
          <div className='flex flex-col items-center'>
            <div className='relative'>
              <img
                src={file.preview}
                alt='Original'
                className='w-16 h-16 object-cover rounded-lg border file-preview'
              />
            </div>
            <span className='text-xs text-gray-500 mt-1'>Original</span>
          </div>
          {(file.convertedPreview || file.status === 'converted') && (
            <div className='flex flex-col items-center'>
              <div className='relative'>
                {file.convertedPreview ? (
                  <img
                    src={file.convertedPreview}
                    alt='Converted'
                    className='w-16 h-16 object-cover rounded-lg border file-preview'
                  />
                ) : (
                  // Placeholder for videos without preview
                  <div className='w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center'>
                    <svg
                      className='w-8 h-8 text-gray-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 8v8h12V8H4zm2 2l4 3 4-3v6H6v-6z' />
                    </svg>
                  </div>
                )}
              </div>
              <span className='text-xs text-gray-500 mt-1'>
                {file.isVideo ? 'WebM' : 'WebP'}
              </span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-medium text-gray-900 truncate'>{file.name}</h4>
            <button
              onClick={handleRemove}
              className='text-gray-400 hover:text-red-500 transition-colors'
              title='Remove file'
              aria-label={`Remove ${file.name}`}
            >
              <FontAwesomeIcon icon={faXmark} className='h-4 w-4' />
            </button>
          </div>

          <div className='flex items-center space-x-4 text-sm text-gray-600 mb-2'>
            <span>Original: {fileSizeInfo.original}</span>
            {dimensionsInfo.original && <span>{dimensionsInfo.original}</span>}
            {file.convertedSize && (
              <>
                <span>→</span>
                <span>
                  {file.isVideo ? 'WebM' : 'WebP'}: {fileSizeInfo.converted}
                </span>
                {dimensionsInfo.final && <span>{dimensionsInfo.final}</span>}
                <span className='text-green-600 font-medium'>
                  ({fileSizeInfo.savings}% smaller)
                </span>
              </>
            )}
          </div>

          {/* Individual Settings */}
          {file.status === 'pending' && !file.isVideo && (
            <div className='mb-3 p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id={`resize-${file.id}`}
                    checked={file.resizeSettings?.enabled || false}
                    onChange={e => handleResizeToggle(e.target.checked)}
                    className='h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                  />
                  <label
                    htmlFor={`resize-${file.id}`}
                    className='ml-2 text-sm text-gray-700'
                  >
                    Customize image settings
                  </label>
                </div>
              </div>

              {file.resizeSettings?.enabled && (
                <div className='space-y-3'>
                  <div>
                    <label
                      htmlFor={`quality-${file.id}`}
                      className='block text-xs font-medium text-gray-700 mb-1'
                    >
                      Quality: {file.quality || 80}%
                    </label>
                    <input
                      id={`quality-${file.id}`}
                      type='range'
                      min='10'
                      max='100'
                      value={file.quality || 80}
                      onChange={e =>
                        handleQualityChange(Number(e.target.value))
                      }
                      className='w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500'
                      aria-label={`Quality slider for ${file.name}`}
                    />
                    <div className='flex justify-between text-xs text-gray-500 mt-1'>
                      <span>Lower Quality</span>
                      <span>Higher Quality</span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <Input
                        type='number'
                        placeholder='Max Width'
                        min='100'
                        max='16384'
                        value={file.resizeSettings.maxWidth}
                        onChange={e =>
                          handleResizeSettingChange(
                            'maxWidth',
                            parseInt(e.target.value) || 2048
                          )
                        }
                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                      />
                    </div>
                    <div>
                      <Input
                        type='number'
                        placeholder='Max Height'
                        min='100'
                        max='16384'
                        value={file.resizeSettings.maxHeight}
                        onChange={e =>
                          handleResizeSettingChange(
                            'maxHeight',
                            parseInt(e.target.value) || 2048
                          )
                        }
                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Individual Video Settings */}
          {file.status === 'pending' && file.isVideo && (
            <div className='mb-3 p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id={`video-${file.id}`}
                    checked={file.videoSettings?.enabled || false}
                    onChange={e => handleVideoToggle(e.target.checked)}
                    className='h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                  />
                  <label
                    htmlFor={`video-${file.id}`}
                    className='ml-2 text-sm text-gray-700'
                  >
                    Change video resolution
                  </label>
                </div>
              </div>

              {file.videoSettings?.enabled && (
                <div className='space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Resolution
                    </label>
                    <select
                      value={file.videoSettings.resolution}
                      onChange={e =>
                        handleVideoSettingChange({
                          resolution: e.target
                            .value as VideoSettings['resolution'],
                          // Clear custom dimensions when not using custom
                          ...(e.target.value !== 'custom' ? {} : {}),
                        })
                      }
                      className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                      title='Select video resolution'
                      aria-label='Video resolution'
                    >
                      <option value='default'>Default (Keep Original)</option>
                      <option value='320x240'>320×240 (240p)</option>
                      <option value='640x480'>640×480 (480p)</option>
                      <option value='1280x720'>1280×720 (720p)</option>
                      <option value='1920x1080'>1920×1080 (1080p)</option>
                      <option value='2560x1440'>2560×1440 (1440p)</option>
                      <option value='3840x2160'>3840×2160 (4K)</option>
                      <option value='custom'>Custom Resolution</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Frame Rate (FPS)
                    </label>
                    <select
                      value={file.videoSettings.fps || 'default'}
                      onChange={e =>
                        handleVideoSettingChange({
                          fps: e.target.value as VideoSettings['fps'],
                        })
                      }
                      className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                      title='Select frame rate'
                      aria-label='Frame rate'
                    >
                      <option value='default'>Default (Keep Original)</option>
                      <option value='12'>12 FPS (Slideshow)</option>
                      <option value='15'>15 FPS (Low)</option>
                      <option value='24'>24 FPS (Cinema)</option>
                      <option value='25'>25 FPS (PAL)</option>
                      <option value='30'>30 FPS (Standard)</option>
                      <option value='48'>48 FPS (High)</option>
                      <option value='50'>50 FPS (PAL High)</option>
                      <option value='60'>60 FPS (Smooth)</option>
                    </select>
                  </div>

                  {file.videoSettings.resolution === 'custom' && (
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <Input
                          type='number'
                          placeholder='Width'
                          min='100'
                          max='7680'
                          value={file.videoSettings.customWidth || ''}
                          onChange={e => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleVideoSettingChange({
                                customWidth: value,
                              });
                            }
                          }}
                          className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>
                      <div>
                        <Input
                          type='number'
                          placeholder='Height'
                          min='100'
                          max='4320'
                          value={file.videoSettings.customHeight || ''}
                          onChange={e => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleVideoSettingChange({
                                customHeight: value,
                              });
                            }
                          }}
                          className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor={`crf-${file.id}`}
                      className='block text-xs font-medium text-gray-700 mb-1'
                    >
                      Quality (CRF): {file.videoSettings.crf}
                    </label>
                    <input
                      id={`crf-${file.id}`}
                      type='range'
                      min='0'
                      max='53'
                      value={file.videoSettings.crf}
                      onChange={e =>
                        handleVideoSettingChange({
                          crf: Number(e.target.value),
                        })
                      }
                      className='w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500'
                      aria-label={`Video quality slider for ${file.name}`}
                    />
                    <div className='flex justify-between text-xs text-gray-500 mt-1'>
                      <span>Better Quality</span>
                      <span>Smaller File</span>
                    </div>
                  </div>

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      id={`audio-${file.id}`}
                      checked={file.videoSettings.audioEnabled}
                      onChange={e =>
                        handleVideoSettingChange({
                          audioEnabled: e.target.checked,
                        })
                      }
                      className='h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor={`audio-${file.id}`}
                      className='ml-2 text-xs text-gray-700'
                    >
                      Include Audio
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          {(file.status === 'converting' ||
            (file.status === 'converted' && file.progress === 100)) && (
            <ProgressBar
              progress={file.progress}
              status={file.status}
              className='mt-2'
            />
          )}

          <div className='flex items-center justify-between mt-3'>
            <div className='flex items-center space-x-2'>
              <StatusBadge status={file.status} />
            </div>

            {file.convertedBlob && (
              <button
                onClick={handleDownload}
                className='text-indigo-600 hover:text-indigo-800 transition-colors flex items-center text-sm'
              >
                <FontAwesomeIcon
                  icon={faArrowDownToBracket}
                  className='h-4 w-4 mr-1'
                />
                Download
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
