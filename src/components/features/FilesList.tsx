import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faArrowDownToBracket,
  faBoxArchive,
  faTrashCan,
} from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import {
  FileItem as FileItemType,
  ResizeSettings,
  VideoSettings,
} from '../../types';
import { Card, CardHeader, Button } from '../ui';
import { FileItem } from './FileItem';

interface FilesListProps {
  files: FileItemType[];
  globalResizeSettings: ResizeSettings;
  isConverting: boolean;
  isCreatingZip: boolean;
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
