import { faGear } from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { FileItem, ResizeSettings, VideoSettings } from '../../types';
import { Button, Card, Input } from '../ui';

interface ConversionSettingsProps {
  files: FileItem[];
  quality: number;
  onQualityChange: (quality: number) => void;
  globalResizeSettings: ResizeSettings;
  onGlobalResizeChange: (
    field: 'maxWidth' | 'maxHeight',
    value: number
  ) => void;
  globalVideoSettings: VideoSettings;
  onGlobalVideoChange: (settings: VideoSettings) => void;
  onApplyGlobalResizeToAll: () => void;
  onApplyGlobalImageSettingsToAll: () => void;
  onApplyGlobalVideoToAll: () => void;
}

export function ConversionSettings({
  files,
  quality,
  onQualityChange,
  globalResizeSettings,
  onGlobalResizeChange,
  globalVideoSettings,
  onGlobalVideoChange,
  onApplyGlobalResizeToAll,
  onApplyGlobalImageSettingsToAll,
  onApplyGlobalVideoToAll,
}: ConversionSettingsProps) {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [isApplyingImageSettings, setIsApplyingImageSettings] = useState(false);
  const [isApplyingVideoSettings, setIsApplyingVideoSettings] = useState(false);

  // Determine file types
  const hasImages = files.some(f => !f.isVideo);
  const hasVideos = files.some(f => f.isVideo);
  const hasMixedTypes = hasImages && hasVideos;

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQualityChange(Number(e.target.value));
  };

  const handleVideoResolutionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const resolution = e.target.value as VideoSettings['resolution'];
    onGlobalVideoChange({
      ...globalVideoSettings,
      resolution,
      // Clear custom dimensions when not using custom
      ...(resolution !== 'custom' && {
        customWidth: undefined,
        customHeight: undefined,
      }),
    });
  };

  const handleCrfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onGlobalVideoChange({
      ...globalVideoSettings,
      crf: Number(e.target.value),
    });
  };

  const handleFpsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fps = e.target.value as VideoSettings['fps'];
    onGlobalVideoChange({
      ...globalVideoSettings,
      fps,
    });
  };

  const handleApplyImageSettings = async () => {
    setIsApplyingImageSettings(true);
    try {
      onApplyGlobalImageSettingsToAll();
      // Small delay to show the feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsApplyingImageSettings(false);
    }
  };

  const handleApplyVideoSettings = async () => {
    setIsApplyingVideoSettings(true);
    try {
      onApplyGlobalVideoToAll();
      // Small delay to show the feedback
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsApplyingVideoSettings(false);
    }
  };

  // Calculate the correct percentage for the range slider background
  const min = 10;
  const max = 100;
  const percentage = ((quality - min) / (max - min)) * 100;

  // Calculate CRF slider percentage (inverted because lower CRF = better quality)
  const crfMin = 0;
  const crfMax = 53;
  const crfPercentage =
    ((globalVideoSettings.crf - crfMin) / (crfMax - crfMin)) * 100;

  // Video resolution options
  const videoResolutions = [
    { value: 'default', label: 'Default (Keep Original)' },
    { value: '320x240', label: '320×240 (240p)' },
    { value: '640x480', label: '640×480 (480p)' },
    { value: '1280x720', label: '1280×720 (720p)' },
    { value: '1920x1080', label: '1920×1080 (1080p)' },
    { value: '2560x1440', label: '2560×1440 (1440p)' },
    { value: '3840x2160', label: '3840×2160 (4K)' },
    { value: 'custom', label: 'Custom Resolution' },
  ];

  // FPS options
  const fpsOptions = [
    { value: 'default', label: 'Default (Keep Original)' },
    { value: '12', label: '12 FPS (Slideshow)' },
    { value: '15', label: '15 FPS (Low)' },
    { value: '24', label: '24 FPS (Cinema)' },
    { value: '25', label: '25 FPS (PAL)' },
    { value: '30', label: '30 FPS (Standard)' },
    { value: '48', label: '48 FPS (High)' },
    { value: '50', label: '50 FPS (PAL High)' },
    { value: '60', label: '60 FPS (Smooth)' },
  ];

  // Render image settings section
  const renderImageSettings = () => (
    <div>
      <div className='flex items-center space-x-4 mb-4'>
        <label className='text-gray-700 font-medium'>Quality:</label>
        <div className='flex-1 max-w-xs'>
          <input
            type='range'
            min='10'
            max='100'
            value={quality}
            onChange={handleQualityChange}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 range-slider'
            style={{
              background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
            }}
          />
        </div>
        <span className='text-gray-700 font-medium min-w-[3rem]'>
          {quality}%
        </span>
      </div>

      <p className='text-sm text-gray-500 mb-6'>
        Higher quality = larger file size. 80% is recommended for web use. PNG
        files with transparency automatically use higher quality to preserve
        alpha channel.
      </p>

      <div className='pt-6 border-t border-gray-200'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-gray-700 font-medium'>Global Image Settings</h4>
          <Button
            onClick={handleApplyImageSettings}
            variant='secondary'
            className='text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors'
            disabled={isApplyingImageSettings}
            loading={isApplyingImageSettings}
          >
            {isApplyingImageSettings
              ? 'Applying...'
              : hasMixedTypes
                ? 'Apply to All Images'
                : 'Apply to All'}
          </Button>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Max Width (px)
            </label>
            <Input
              type='number'
              min='100'
              max='16384'
              value={globalResizeSettings.maxWidth}
              onChange={e =>
                onGlobalResizeChange(
                  'maxWidth',
                  parseInt(e.target.value) || 2048
                )
              }
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Max Height (px)
            </label>
            <Input
              type='number'
              min='100'
              max='16384'
              value={globalResizeSettings.maxHeight}
              onChange={e =>
                onGlobalResizeChange(
                  'maxHeight',
                  parseInt(e.target.value) || 2048
                )
              }
            />
          </div>
        </div>

        <p className='text-sm text-gray-500 mt-2'>
          Images will be resized to fit within these dimensions while
          maintaining aspect ratio. Only images larger than these dimensions
          will be resized (no upscaling).
        </p>
      </div>
    </div>
  );

  // Render video settings section
  const renderVideoSettings = () => (
    <div>
      <div className='flex items-center space-x-4 mb-4'>
        <label className='text-gray-700 font-medium'>Quality (CRF):</label>
        <div className='flex-1 max-w-xs'>
          <input
            type='range'
            min='0'
            max='53'
            value={globalVideoSettings.crf}
            onChange={handleCrfChange}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 range-slider'
            style={{
              background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${crfPercentage}%, #e5e7eb ${crfPercentage}%, #e5e7eb 100%)`,
            }}
          />
        </div>
        <span className='text-gray-700 font-medium min-w-[3rem]'>
          {globalVideoSettings.crf}
        </span>
      </div>

      <p className='text-sm text-gray-500 mb-6'>
        Lower values = better quality but larger files and longer conversion
        times. Recommended: 15-35 (28 is default).
      </p>

      <div className='pt-6 border-t border-gray-200'>
        <div className='flex items-center justify-between mb-6'>
          <h4 className='text-gray-700 font-medium'>Global Video Settings</h4>
          <Button
            onClick={handleApplyVideoSettings}
            variant='secondary'
            className='text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors'
            disabled={isApplyingVideoSettings}
            loading={isApplyingVideoSettings}
          >
            {isApplyingVideoSettings
              ? 'Applying...'
              : hasMixedTypes
                ? 'Apply to All Videos'
                : 'Apply to All'}
          </Button>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Resolution
          </label>
          <select
            value={globalVideoSettings.resolution}
            onChange={handleVideoResolutionChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
          >
            {videoResolutions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {globalVideoSettings.resolution === 'custom' && (
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Width (px)
                </label>
                <Input
                  type='number'
                  min='100'
                  max='7680'
                  value={globalVideoSettings.customWidth || ''}
                  onChange={e =>
                    onGlobalVideoChange({
                      ...globalVideoSettings,
                      customWidth: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder='1920'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Height (px)
                </label>
                <Input
                  type='number'
                  min='100'
                  max='4320'
                  value={globalVideoSettings.customHeight || ''}
                  onChange={e =>
                    onGlobalVideoChange({
                      ...globalVideoSettings,
                      customHeight: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder='1080'
                />
              </div>
            </div>
          )}
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Frame Rate (FPS)
          </label>
          <select
            value={globalVideoSettings.fps || 'default'}
            onChange={handleFpsChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
          >
            {fpsOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className='flex items-center'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={globalVideoSettings.audioEnabled}
              onChange={e =>
                onGlobalVideoChange({
                  ...globalVideoSettings,
                  audioEnabled: e.target.checked,
                })
              }
              className='mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
            />
            <span className='text-sm font-medium text-gray-700'>
              Include Audio
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <Card className='mb-6'>
      <div className='flex items-center mb-4'>
        <FontAwesomeIcon icon={faGear} className='h-5 w-5 text-gray-600 mr-2' />
        <h3 className='text-lg font-semibold text-gray-800'>
          Conversion Settings
        </h3>
      </div>

      {hasMixedTypes ? (
        <div>
          <div className='flex border-b border-gray-200 mb-6'>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'images'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Image Settings
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'videos'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Video Settings
            </button>
          </div>

          {activeTab === 'images'
            ? renderImageSettings()
            : renderVideoSettings()}
        </div>
      ) : hasImages ? (
        renderImageSettings()
      ) : hasVideos ? (
        renderVideoSettings()
      ) : null}
    </Card>
  );
}
