import { useState, useCallback } from 'react';
import { trackFileUpload } from '../utils/analytics';

export function useDragAndDrop(onFilesDropped: (files: File[]) => void) {
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        // Track file upload via drag and drop
        trackFileUpload(droppedFiles.length, 'drag_drop');
        onFilesDropped(droppedFiles);
      }
    },
    [onFilesDropped]
  );

  return {
    dragActive,
    handleDrag,
    handleDrop,
  };
}
