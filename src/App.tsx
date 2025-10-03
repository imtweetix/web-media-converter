import { useState, useCallback } from 'react';
import { ResizeSettings } from './types';
import {
  useFileManager,
  useConversion,
  useDownload,
} from './hooks';
import {
  Header,
  UploadArea,
  ConversionSettings,
  FilesList,
  InfoCard,
  Footer,
} from './components/features';

function App() {
  const [quality, setQuality] = useState<number>(80);
  const [globalResizeSettings, setGlobalResizeSettings] =
    useState<ResizeSettings>({
      enabled: true,
      maxWidth: 2048,
      maxHeight: 2048,
    });

  const {
    files,
    addFiles,
    removeFile,
    clearAllFiles,
    updateFile,
    updateFileResizeSettings,
    applyGlobalResizeToAll,
  } = useFileManager();

  const { isConverting, convertAllFiles } = useConversion();
  const { isCreatingZip, downloadFile, downloadAll } = useDownload();

  const handleGlobalResizeChange = useCallback(
    (field: 'maxWidth' | 'maxHeight', value: number) => {
      setGlobalResizeSettings(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleConvertAll = useCallback(() => {
    convertAllFiles(files, quality, globalResizeSettings, updateFile);
  }, [convertAllFiles, files, quality, globalResizeSettings, updateFile]);

  const handleDownloadAll = useCallback(() => {
    downloadAll(files);
  }, [downloadAll, files]);

  const handleApplyGlobalResize = useCallback(() => {
    applyGlobalResizeToAll(globalResizeSettings);
  }, [applyGlobalResizeToAll, globalResizeSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Header />

        <UploadArea onFilesSelected={addFiles} />

        {files.length > 0 && (
          <ConversionSettings
            quality={quality}
            onQualityChange={setQuality}
            globalResizeSettings={globalResizeSettings}
            onGlobalResizeChange={handleGlobalResizeChange}
            onApplyGlobalResizeToAll={handleApplyGlobalResize}
          />
        )}

        {files.length > 0 && (
          <FilesList
            files={files}
            globalResizeSettings={globalResizeSettings}
            isConverting={isConverting}
            isCreatingZip={isCreatingZip}
            onConvertAll={handleConvertAll}
            onDownloadAll={handleDownloadAll}
            onClearAll={clearAllFiles}
            onRemoveFile={removeFile}
            onDownloadFile={downloadFile}
            onUpdateResizeSettings={updateFileResizeSettings}
          />
        )}

        <InfoCard />

        <Footer />
      </div>
    </div>
  );
}

export default App;