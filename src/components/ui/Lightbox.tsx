import { faXmark } from '@awesome.me/kit-26a4d59a75/icons/classic/regular';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  fileName: string;
}

export function Lightbox({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  fileName,
}: LightboxProps) {
  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4'
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10'
        aria-label='Close lightbox'
      >
        <FontAwesomeIcon icon={faXmark} className='h-8 w-8' />
      </button>

      {/* File name */}
      <div className='absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded'>
        {fileName}
      </div>

      {/* Media content */}
      <div
        className='max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center'
        onClick={e => e.stopPropagation()}
      >
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt={fileName}
            className='max-w-full max-h-full object-contain rounded-lg shadow-2xl'
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className='max-w-full max-h-full rounded-lg shadow-2xl'
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Instructions */}
      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded'>
        Press ESC or click outside to close
      </div>
    </div>
  );
}
