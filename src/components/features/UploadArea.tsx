import { faArrowUpFromBracket } from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { useDragAndDrop } from '../../hooks';
import { trackFileUpload } from '../../utils/analytics';
import { Button, Input } from '../ui';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

export function UploadArea({ onFilesSelected }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dragActive, handleDrag, handleDrop } =
    useDragAndDrop(onFilesSelected);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        // Track file upload via file picker
        trackFileUpload(files.length, 'file_picker');
        onFilesSelected(files);
      }
    }
  };

  return (
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
      <FontAwesomeIcon
        icon={faArrowUpFromBracket}
        className='h-12 w-12 text-gray-400 mx-auto mb-4'
      />
      <h3 className='text-xl font-semibold text-gray-700 mb-2'>
        Drop images or videos here or click to upload
      </h3>
      <p className='text-gray-500 mb-4'>
        Images: JPEG, PNG, GIF, BMP → WebP
        <br />
        Videos: MP4, MOV, 3GP → WebM
      </p>
      <Button onClick={() => fileInputRef.current?.click()} className='mx-auto'>
        Choose Files
      </Button>
      <Input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp,video/mp4,video/mov,video/quicktime,video/3gpp'
        onChange={handleFileInputChange}
      />
    </div>
  );
}
