import { useState, useCallback } from 'react';
import { FileItem } from '../types';
import { createZipWithBrowserAPIs, downloadBlob } from '../utils/zipUtils';
import { ConversionService } from '../services/conversionService';

export function useDownload() {
  const [isCreatingZip, setIsCreatingZip] = useState<boolean>(false);

  const downloadFile = useCallback((file: FileItem): void => {
    if (!file.convertedBlob) return;

    // Use correct extension based on file type
    const extension = file.isVideo ? '.webm' : '.webp';
    const filename = ConversionService.sanitizeFilename(
      file.name.replace(/\.[^/.]+$/, extension)
    );
    downloadBlob(file.convertedBlob, filename);
  }, []);

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

  const downloadAll = useCallback(
    async (files: FileItem[]): Promise<void> => {
      const convertedFiles = files.filter(f => f.convertedBlob);
      if (convertedFiles.length === 0) return;

      if (convertedFiles.length === 1) {
        downloadFile(convertedFiles[0]);
        return;
      }

      setIsCreatingZip(true);

      try {
        const zipBlob = await createZipWithBrowserAPIs(convertedFiles);
        const filename = `converted-files-${new Date().toISOString().slice(0, 10)}.zip`;
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
    },
    [downloadFile, downloadFilesIndividually]
  );

  return {
    isCreatingZip,
    downloadFile,
    downloadAll,
  };
}