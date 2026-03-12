import {
  faArrowDownToBracket,
  faBolt,
  faBoxArchive,
  faTrashCan,
} from '@awesome.me/kit-c9f4d240a1/icons/classic/regular';
import { FFmpegLoadState } from '../../services/ffmpegLoader';
import {
  FileItem as FileItemType,
  ResizeSettings,
  VideoSettings,
} from '../../types';
import { Button, Card, CardHeader } from '../ui';
import { FileItem } from './FileItem';

interface FilesListProps {
  files: FileItemType[];
  globalResizeSettings: ResizeSettings;
  isConverting: boolean;
  isCreatingZip: boolean;
  ffmpegState: FFmpegLoadState;
  ffmpegLoadProgress: number;
  onConvertAll: () => void;
  onDownloadAll: () => void;
  onClearAll: () => void;
  onRemoveFile: (id: string | number) => void;
  onDownloadFile: (file: FileItemType) => void;
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

export function FilesList({
  files,
  globalResizeSettings,
  isConverting,
  isCreatingZip,
  ffmpegState,
  ffmpegLoadProgress,
  onConvertAll,
  onDownloadAll,
  onClearAll,
  onRemoveFile,
  onDownloadFile,
  onUpdateResizeSettings,
  onUpdateVideoSettings,
  onUpdateFile,
}: FilesListProps) {
  const convertedFiles = files.filter(f => f.convertedBlob);
  const allConverted = files.every(
    f => f.status === 'converted' || f.status === 'error'
  );

  return (
    <Card padding={false} className='overflow-hidden mb-6'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Files ({files.length})
          </h3>
          <div className='flex space-x-3'>
            <Button
              onClick={onConvertAll}
              disabled={isConverting || allConverted}
              icon={faBolt}
              loading={isConverting}
            >
              {isConverting ? 'Converting...' : 'Convert All'}
            </Button>

            <Button
              onClick={onDownloadAll}
              disabled={convertedFiles.length === 0 || isCreatingZip}
              variant={
                convertedFiles.length > 0 && !isCreatingZip
                  ? 'success'
                  : 'secondary'
              }
              icon={
                isCreatingZip
                  ? faBoxArchive
                  : convertedFiles.length > 1
                    ? faBoxArchive
                    : faArrowDownToBracket
              }
              loading={isCreatingZip}
            >
              {isCreatingZip
                ? 'Creating ZIP...'
                : convertedFiles.length > 1
                  ? 'Download ZIP'
                  : 'Download'}
            </Button>

            <Button
              onClick={onClearAll}
              disabled={files.length === 0}
              variant='danger'
              icon={faTrashCan}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* FFmpeg loading banner */}
      {ffmpegState === 'loading' && (
        <div className='px-4 py-3 bg-blue-50 border-b border-blue-100'>
          <div className='flex items-center gap-3'>
            <div className='h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-blue-800'>
                Preparing video converter...
              </p>
              <p className='text-xs text-blue-600'>
                Downloading video engine (~10 MB, cached for future use)
              </p>
              <div className='mt-1.5 w-full bg-blue-100 rounded-full h-1.5'>
                <div
                  className='h-1.5 rounded-full bg-blue-500 transition-all duration-300'
                  style={{
                    width: `${Math.max(0, Math.min(100, ffmpegLoadProgress))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FFmpeg error banner */}
      {ffmpegState === 'error' && (
        <div className='px-4 py-3 bg-amber-50 border-b border-amber-100'>
          <div className='flex items-center gap-3'>
            <span className='text-amber-500 text-lg shrink-0'>&#9888;</span>
            <p className='text-sm text-amber-800'>
              Video engine failed to load. Using browser fallback encoder (may
              be slower).
            </p>
          </div>
        </div>
      )}

      <div className='divide-y'>
        {files.map(file => (
          <FileItem
            key={file.id}
            file={file}
            globalResizeSettings={globalResizeSettings}
            onRemove={onRemoveFile}
            onDownload={onDownloadFile}
            onUpdateResizeSettings={onUpdateResizeSettings}
            onUpdateVideoSettings={onUpdateVideoSettings}
            onUpdateFile={onUpdateFile}
          />
        ))}
      </div>
    </Card>
  );
}
