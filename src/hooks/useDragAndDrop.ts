import { useState, useCallback } from 'react';

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
      onFilesDropped(droppedFiles);
    },
    [onFilesDropped]
  );

  return {
    dragActive,
    handleDrag,
    handleDrop,
  };
}