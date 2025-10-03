import { faGear } from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ResizeSettings } from '../../types';
import { Button, Card, Input } from '../ui';

interface ConversionSettingsProps {
  quality: number;
  onQualityChange: (quality: number) => void;
  globalResizeSettings: ResizeSettings;
  onGlobalResizeChange: (
    field: 'maxWidth' | 'maxHeight',
    value: number
  ) => void;
  onApplyGlobalResizeToAll: () => void;
}

export function ConversionSettings({
  quality,
  onQualityChange,
  globalResizeSettings,
  onGlobalResizeChange,
  onApplyGlobalResizeToAll,
}: ConversionSettingsProps) {
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQualityChange(Number(e.target.value));
  };

  // Calculate the correct percentage for the range slider background
  const min = 10;
  const max = 100;
  const percentage = ((quality - min) / (max - min)) * 100;

  return (
    <Card className='mb-6'>
      <div className='flex items-center mb-4'>
        <FontAwesomeIcon icon={faGear} className='h-5 w-5 text-gray-600 mr-2' />
        <h3 className='text-lg font-semibold text-gray-800'>
          Conversion Settings
        </h3>
      </div>

      <div className='flex items-center space-x-4'>
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

      <p className='text-sm text-gray-500 mt-2'>
        Higher quality = larger file size. 80% is recommended for web use. PNG
        files with transparency automatically use higher quality to preserve
        alpha channel.
      </p>

      <div className='mt-6 pt-6 border-t border-gray-200'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-gray-700 font-medium'>
            Global Image Resize Settings
          </h4>
          <Button
            onClick={onApplyGlobalResizeToAll}
            variant='secondary'
            className='text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors'
          >
            Apply to All
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
    </Card>
  );
}
