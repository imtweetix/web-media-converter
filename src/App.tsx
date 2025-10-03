import {
  Archive,
  Download,
  Settings,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FileItem, ProgressCallback, ResizeSettings } from './types';
import { createZipWithBrowserAPIs, downloadBlob } from './utils/zipUtils';

function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isCreatingZip, setIsCreatingZip] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [globalResizeSettings, setGlobalResizeSettings] = useState<ResizeSettings>({
    enabled: true,
    maxWidth: 2048,
    maxHeight: 2048,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateResizeDimensions = useCallback(
    (originalWidth: number, originalHeight: number, resizeSettings: ResizeSettings) => {
      if (!resizeSettings.enabled) {
        return { width: originalWidth, height: originalHeight };
      }

      const { maxWidth, maxHeight } = resizeSettings;

      // Only downsize, never upscale
      if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
        return { width: originalWidth, height: originalHeight };
      }

      // Calculate scale factor to maintain aspect ratio
      const scaleX = maxWidth / originalWidth;
      const scaleY = maxHeight / originalHeight;
      const scale = Math.min(scaleX, scaleY);

      return {
        width: Math.round(originalWidth * scale),
        height: Math.round(originalHeight * scale),
      };
    },
    []
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = useCallback((newFiles: File[]): void => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

    const imageFiles = newFiles.filter((file: File) => {
      const isImage = file.type.startsWith('image/');
      const isSupported = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/webp',
      ].includes(file.type.toLowerCase());

      if (file.size > MAX_FILE_SIZE) {
        console.warn(`File ${file.name} exceeds maximum size limit of 50MB`);
        alert(`File "${file.name}" is too large. Maximum file size is 50MB.`);
        return false;
      }

      return isImage && (isSupported || file.type.startsWith('image/'));
    });

    const processedFiles: FileItem[] = imageFiles.map((file: File) => ({
      id: crypto.randomUUID?.() || Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      convertedBlob: null,
      convertedSize: null,
      convertedPreview: null,
      resizeSettings: { enabled: false, maxWidth: 2048, maxHeight: 2048 },
    }));

    setFiles(prev => [...prev, ...processedFiles]);
  }, []);

  const removeFile = useCallback((id: string | number): void => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      if (fileToRemove?.convertedPreview) {
        URL.revokeObjectURL(fileToRemove.convertedPreview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAllFiles = useCallback((): void => {
    files.forEach((file: FileItem) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      if (file.convertedPreview) {
        URL.revokeObjectURL(file.convertedPreview);
      }
    });

    setFiles([]);
  }, [files]);

  const convertToWebP = useCallback(
    async (file: FileItem, updateProgress: ProgressCallback): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        updateProgress(10);

        img.onload = () => {
          try {
            updateProgress(40);

            const MAX_CANVAS_DIMENSION = 16384; // Common browser limit
            if (
              img.width > MAX_CANVAS_DIMENSION ||
              img.height > MAX_CANVAS_DIMENSION
            ) {
              reject(
                new Error(
                  `Image dimensions too large. Maximum ${MAX_CANVAS_DIMENSION}x${MAX_CANVAS_DIMENSION} pixels.`
                )
              );
              return;
            }

            // Store original dimensions
            const originalDimensions = { width: img.width, height: img.height };

            // Calculate final dimensions based on resize settings
            // Use global settings if individual resize is not enabled, otherwise use individual settings
            const effectiveResizeSettings = file.resizeSettings?.enabled
              ? file.resizeSettings
              : globalResizeSettings;
            const finalDimensions = calculateResizeDimensions(img.width, img.height, effectiveResizeSettings);

            // Update file with dimensions info
            setFiles(prev =>
              prev.map(f =>
                f.id === file.id
                  ? { ...f, originalDimensions, finalDimensions }
                  : f
              )
            );

            canvas.width = finalDimensions.width;
            canvas.height = finalDimensions.height;

            updateProgress(60);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, 0, 0, finalDimensions.width, finalDimensions.height);

            updateProgress(80);

            const hasTransparency =
              file.file.type === 'image/png' ||
              file.file.name.toLowerCase().endsWith('.png');
            const webpQuality =
              hasTransparency && quality > 90 ? 1.0 : quality / 100;

            canvas.toBlob(
              blob => {
                if (blob) {
                  updateProgress(100);
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create WebP blob'));
                }
              },
              'image/webp',
              webpQuality
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.crossOrigin = 'anonymous';

        if (file.file) {
          const reader = new FileReader();
          reader.onload = e => {
            if (e.target?.result) {
              img.src = e.target.result as string;
            }
          };
          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file.file);
        } else {
          img.src = file.preview;
        }
      });
    },
    [quality, calculateResizeDimensions, globalResizeSettings]
  );

  const convertAllFiles = useCallback(async (): Promise<void> => {
    setIsConverting(true);

    const filesToConvert = files.filter(f => f.status === 'pending');

    setFiles(prev =>
      prev.map(file =>
        file.status === 'pending'
          ? { ...file, progress: 0, status: 'converting' }
          : file
      )
    );

    for (const file of filesToConvert) {
      try {
        const updateProgress: ProgressCallback = (progress: number) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, progress, status: 'converting' } : f
            )
          );
        };

        const convertedBlob = await convertToWebP(file, updateProgress);

        if (convertedBlob) {
          const convertedPreview = URL.createObjectURL(convertedBlob);

          setFiles(prev =>
            prev.map(f =>
              f.id === file.id
                ? {
                    ...f,
                    status: 'converted',
                    progress: 100,
                    convertedBlob,
                    convertedSize: convertedBlob.size,
                    convertedPreview,
                  }
                : f
            )
          );
        } else {
          setFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, status: 'error', progress: 0 } : f
            )
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Conversion error for file:', file.name, errorMessage);
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, status: 'error', progress: 0 } : f
          )
        );
      }

      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setIsConverting(false);
  }, [files, convertToWebP]);

  const downloadFile = useCallback((file: FileItem): void => {
    if (!file.convertedBlob) return;

    const sanitizeFilename = (filename: string): string => {
      return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/^\.+/, '');
    };

    const filename = sanitizeFilename(file.name.replace(/\.[^/.]+$/, '.webp'));
    downloadBlob(file.convertedBlob, filename);
  }, []);

  const downloadAll = useCallback(async (): Promise<void> => {
    const convertedFiles = files.filter(f => f.convertedBlob);
    if (convertedFiles.length === 0) return;

    if (convertedFiles.length === 1) {
      downloadFile(convertedFiles[0]);
      return;
    }

    setIsCreatingZip(true);

    try {
      const zipBlob = await createZipWithBrowserAPIs(convertedFiles);
      const filename = `webp-images-${new Date().toISOString().slice(0, 10)}.zip`;
      downloadBlob(zipBlob, filename);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        'ZIP creation failed, using individual downloads:',
        errorMessage
      );
      downloadFilesIndividually(convertedFiles);
    }

    setIsCreatingZip(false);
  }, [files, downloadFile]);

  const downloadFilesIndividually = useCallback(
    (convertedFiles: FileItem[]): void => {
      convertedFiles.forEach((file, index) => {
        setTimeout(() => {
          downloadFile(file);
        }, index * 800);
      });
    },
    [downloadFile]
  );

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getSavingsPercentage = useCallback(
    (original: number, converted: number): number => {
      if (!original || !converted) return 0;
      return Math.round(((original - converted) / original) * 100);
    },
    []
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(Array.from(e.target.files));
      }
    },
    [handleFiles]
  );

  const handleQualityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuality(Number(e.target.value));
    },
    []
  );


  const handleGlobalResizeChange = useCallback(
    (field: 'maxWidth' | 'maxHeight', value: number) => {
      setGlobalResizeSettings(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateFileResizeSettings = useCallback(
    (fileId: string | number, resizeSettings: ResizeSettings) => {
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, resizeSettings } : f
        )
      );
    },
    []
  );

  const applyGlobalResizeToAll = useCallback(() => {
    setFiles(prev =>
      prev.map(f => ({ ...f, resizeSettings: { ...globalResizeSettings } }))
    );
  }, [globalResizeSettings]);

  useEffect(() => {
    return () => {
      files.forEach((file: FileItem) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
        if (file.convertedPreview) {
          URL.revokeObjectURL(file.convertedPreview);
        }
      });
    };
  }, [files]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center mb-4'>
            <Zap className='h-8 w-8 text-indigo-600 mr-2' />
            <h1 className='text-4xl font-bold text-gray-900'>WebP Converter</h1>
          </div>
          <p className='text-lg text-gray-600'>
            Convert your images to WebP format for better web performance
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 mb-6 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 bg-white hover:border-indigo-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>
            Drop images here or click to upload
          </h3>
          <p className='text-gray-500 mb-4'>
            Supports JPEG, PNG, GIF, BMP, and TIFF formats
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className='bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors'
          >
            Choose Files
          </button>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            accept='image/*'
            className='hidden'
            onChange={handleFileInputChange}
          />
        </div>

        {/* Quality Settings */}
        {files.length > 0 && (
          <div className='bg-white rounded-xl p-6 mb-6 shadow-sm'>
            <div className='flex items-center mb-4'>
              <Settings className='h-5 w-5 text-gray-600 mr-2' />
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
                  className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${quality}%, #e5e7eb ${quality}%, #e5e7eb 100%)`,
                  }}
                />
              </div>
              <span className='text-gray-700 font-medium min-w-[3rem]'>
                {quality}%
              </span>
            </div>
            <p className='text-sm text-gray-500 mt-2'>
              Higher quality = larger file size. 80% is recommended for web use.
              PNG files with transparency automatically use higher quality to
              preserve alpha channel.
            </p>

            <div className='mt-6 pt-6 border-t border-gray-200'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='text-gray-700 font-medium'>Global Resize Settings</h4>
                <button
                  onClick={applyGlobalResizeToAll}
                  className='text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition-colors'
                >
                  Apply to All
                </button>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Max Width (px)
                  </label>
                  <input
                    type='number'
                    min='100'
                    max='16384'
                    value={globalResizeSettings.maxWidth}
                    onChange={(e) => handleGlobalResizeChange('maxWidth', parseInt(e.target.value) || 2048)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Max Height (px)
                  </label>
                  <input
                    type='number'
                    min='100'
                    max='16384'
                    value={globalResizeSettings.maxHeight}
                    onChange={(e) => handleGlobalResizeChange('maxHeight', parseInt(e.target.value) || 2048)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                  />
                </div>
              </div>

              <p className='text-sm text-gray-500 mt-2'>
                Images will be resized to fit within these dimensions while maintaining aspect ratio.
                Only images larger than these dimensions will be resized (no upscaling).
              </p>
            </div>
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className='bg-white rounded-xl shadow-sm overflow-hidden mb-6'>
            <div className='p-6 border-b bg-gray-50'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-800'>
                  Files ({files.length})
                </h3>
                <div className='flex space-x-3'>
                  <button
                    onClick={convertAllFiles}
                    disabled={
                      isConverting ||
                      files.every(
                        f => f.status === 'converted' || f.status === 'error'
                      )
                    }
                    className='btn-primary'
                  >
                    <Zap className='h-4 w-4 mr-2' />
                    {isConverting ? 'Converting...' : 'Convert All'}
                  </button>
                  <button
                    onClick={downloadAll}
                    disabled={
                      !files.some(f => f.convertedBlob) || isCreatingZip
                    }
                    className='btn-secondary'
                  >
                    {isCreatingZip ? (
                      <>
                        <Archive className='h-4 w-4 mr-2 animate-spin' />
                        Creating ZIP...
                      </>
                    ) : files.filter(f => f.convertedBlob).length > 1 ? (
                      <>
                        <Archive className='h-4 w-4 mr-2' />
                        Download ZIP
                      </>
                    ) : (
                      <>
                        <Download className='h-4 w-4 mr-2' />
                        Download
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearAllFiles}
                    disabled={files.length === 0}
                    className='btn-danger'
                  >
                    <Trash2 className='h-4 w-4 mr-2' />
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className='divide-y'>
              {files.map(file => (
                <div key={file.id} className='p-6'>
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
                        <span className='text-xs text-gray-500 mt-1'>
                          Original
                        </span>
                      </div>
                      {file.convertedPreview && (
                        <div className='flex flex-col items-center'>
                          <div className='relative'>
                            <img
                              src={file.convertedPreview}
                              alt='Converted'
                              className='w-16 h-16 object-cover rounded-lg border file-preview'
                            />
                          </div>
                          <span className='text-xs text-gray-500 mt-1'>
                            WebP
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium text-gray-900 truncate'>
                          {file.name}
                        </h4>
                        <button
                          onClick={() => removeFile(file.id)}
                          className='text-gray-400 hover:text-red-500 transition-colors'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      </div>

                      <div className='flex items-center space-x-4 text-sm text-gray-600 mb-2'>
                        <span>Original: {formatFileSize(file.size)}</span>
                        {file.originalDimensions && (
                          <span>
                            {file.originalDimensions.width}×{file.originalDimensions.height}
                          </span>
                        )}
                        {file.convertedSize && (
                          <>
                            <span>→</span>
                            <span>
                              WebP: {formatFileSize(file.convertedSize)}
                            </span>
                            {file.finalDimensions && (
                              <span>
                                {file.finalDimensions.width}×{file.finalDimensions.height}
                              </span>
                            )}
                            <span className='text-green-600 font-medium'>
                              (
                              {getSavingsPercentage(
                                file.size,
                                file.convertedSize
                              )}
                              % smaller)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Individual Resize Settings */}
                      {file.status === 'pending' && (
                        <div className='mb-3 p-3 bg-gray-50 rounded-lg'>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center'>
                              <input
                                type='checkbox'
                                id={`resize-${file.id}`}
                                checked={file.resizeSettings?.enabled || false}
                                onChange={(e) => {
                                  const currentSettings = file.resizeSettings || globalResizeSettings;
                                  updateFileResizeSettings(file.id, {
                                    ...currentSettings,
                                    enabled: e.target.checked,
                                  });
                                }}
                                className='h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                              />
                              <label htmlFor={`resize-${file.id}`} className='ml-2 text-sm text-gray-700'>
                                Resize this image
                              </label>
                            </div>
                          </div>

                          {file.resizeSettings?.enabled && (
                            <div className='grid grid-cols-2 gap-2'>
                              <div>
                                <input
                                  type='number'
                                  placeholder='Max Width'
                                  min='100'
                                  max='16384'
                                  value={file.resizeSettings.maxWidth}
                                  onChange={(e) => {
                                    const currentSettings = file.resizeSettings || globalResizeSettings;
                                    updateFileResizeSettings(file.id, {
                                      ...currentSettings,
                                      maxWidth: parseInt(e.target.value) || 2048,
                                    });
                                  }}
                                  className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                                />
                              </div>
                              <div>
                                <input
                                  type='number'
                                  placeholder='Max Height'
                                  min='100'
                                  max='16384'
                                  value={file.resizeSettings.maxHeight}
                                  onChange={(e) => {
                                    const currentSettings = file.resizeSettings || globalResizeSettings;
                                    updateFileResizeSettings(file.id, {
                                      ...currentSettings,
                                      maxHeight: parseInt(e.target.value) || 2048,
                                    });
                                  }}
                                  className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      {(file.status === 'converting' ||
                        (file.status === 'converted' &&
                          file.progress === 100)) && (
                        <div className='mt-2'>
                          <div className='flex items-center justify-between text-xs text-gray-600 mb-1'>
                            <span>Conversion Progress</span>
                            <span>{file.progress}%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                file.status === 'converted'
                                  ? 'bg-green-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className='flex items-center justify-between mt-3'>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              file.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : file.status === 'converting'
                                  ? 'bg-blue-100 text-blue-800'
                                  : file.status === 'converted'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {file.status === 'pending' && 'Ready to convert'}
                            {file.status === 'converting' && 'Converting...'}
                            {file.status === 'converted' && 'Converted'}
                            {file.status === 'error' && 'Conversion failed'}
                          </span>
                        </div>

                        {file.convertedBlob && (
                          <button
                            onClick={() => downloadFile(file)}
                            className='text-indigo-600 hover:text-indigo-800 transition-colors flex items-center text-sm'
                          >
                            <Download className='h-4 w-4 mr-1' />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <div className='flex items-start space-x-3'>
            <Zap className='h-6 w-6 text-indigo-600 mt-1' />
            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                About WebP Format
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                WebP is a modern image format that provides superior lossless
                and lossy compression for images on the web. It typically
                reduces file sizes by 25-50% compared to JPEG and PNG while
                maintaining similar quality, making your websites load faster
                and use less bandwidth.
              </p>
              <div className='flex items-center space-x-4 text-sm text-gray-500'>
                <div className='flex items-center'>
                  <Archive className='h-4 w-4 mr-1' />
                  <span>Built-in ZIP creation</span>
                </div>
                <div className='flex items-center'>
                  <span className='w-3 h-3 mr-1 rounded file-preview'></span>
                  <span>Transparency preserved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
