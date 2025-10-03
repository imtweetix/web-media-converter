import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowDownToBracket } from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import { FileItem as FileItemType, ResizeSettings } from '../../types';
import { ConversionService } from '../../services/conversionService';
import { ProgressBar, StatusBadge, Input } from '../ui';

interface FileItemProps {
  file: FileItemType;
  globalResizeSettings: ResizeSettings;
  onRemove: (id: string | number) => void;
  onDownload: (file: FileItemType) => void;
  onUpdateResizeSettings: (fileId: string | number, settings: ResizeSettings) => void;
}

export function FileItem({
  file,
  globalResizeSettings,
  onRemove,
  onDownload,
  onUpdateResizeSettings,
}: FileItemProps) {
  const formatFileSize = ConversionService.formatFileSize;
  const getSavingsPercentage = ConversionService.getSavingsPercentage;

  const handleResizeToggle = (enabled: boolean) => {
    const currentSettings = file.resizeSettings || globalResizeSettings;
    onUpdateResizeSettings(file.id, {
      ...currentSettings,
      enabled,
    });
  };

  const handleResizeSettingChange = (field: 'maxWidth' | 'maxHeight', value: number) => {
    const currentSettings = file.resizeSettings || globalResizeSettings;
    onUpdateResizeSettings(file.id, {
      ...currentSettings,
      [field]: value,
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-start space-x-4">
        {/* Preview Images */}
        <div className="flex space-x-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={file.preview}
                alt="Original"
                className="w-16 h-16 object-cover rounded-lg border file-preview"
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">Original</span>
          </div>
          {file.convertedPreview && (
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={file.convertedPreview}
                  alt="Converted"
                  className="w-16 h-16 object-cover rounded-lg border file-preview"
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">WebP</span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
            <button
              onClick={() => onRemove(file.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
            <span>Original: {formatFileSize(file.size)}</span>
            {file.originalDimensions && (
              <span>
                {file.originalDimensions.width}×{file.originalDimensions.height}
              </span>
            )}
            {file.convertedSize && (
              <>
                <span>→</span>
                <span>WebP: {formatFileSize(file.convertedSize)}</span>
                {file.finalDimensions && (
                  <span>
                    {file.finalDimensions.width}×{file.finalDimensions.height}
                  </span>
                )}
                <span className="text-green-600 font-medium">
                  ({getSavingsPercentage(file.size, file.convertedSize)}% smaller)
                </span>
              </>
            )}
          </div>

          {/* Individual Resize Settings */}
          {file.status === 'pending' && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`resize-${file.id}`}
                    checked={file.resizeSettings?.enabled || false}
                    onChange={e => handleResizeToggle(e.target.checked)}
                    className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`resize-${file.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    Resize this image
                  </label>
                </div>
              </div>

              {file.resizeSettings?.enabled && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      placeholder="Max Width"
                      min="100"
                      max="16384"
                      value={file.resizeSettings.maxWidth}
                      onChange={e =>
                        handleResizeSettingChange(
                          'maxWidth',
                          parseInt(e.target.value) || 2048
                        )
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max Height"
                      min="100"
                      max="16384"
                      value={file.resizeSettings.maxHeight}
                      onChange={e =>
                        handleResizeSettingChange(
                          'maxHeight',
                          parseInt(e.target.value) || 2048
                        )
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
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
              className="mt-2"
            />
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <StatusBadge status={file.status} />
            </div>

            {file.convertedBlob && (
              <button
                onClick={() => onDownload(file)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center text-sm"
              >
                <FontAwesomeIcon
                  icon={faArrowDownToBracket}
                  className="h-4 w-4 mr-1"
                />
                Download
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}