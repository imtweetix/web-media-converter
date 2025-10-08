import { useState, useCallback } from 'react';
import { ResizeSettings, VideoSettings } from './types';
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
  const [globalVideoSettings, setGlobalVideoSettings] =
    useState<VideoSettings>({
      resolution: 'default',
      crf: 28,
      fps: 'default',
      audioEnabled: true,
    });

  const {
    files,
    addFiles,
    removeFile,
    clearAllFiles,
    updateFile,
    updateFileResizeSettings,
    updateFileVideoSettings,
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
    convertAllFiles(files, quality, globalResizeSettings, globalVideoSettings, updateFile);
  }, [convertAllFiles, files, quality, globalResizeSettings, globalVideoSettings, updateFile]);

  const handleDownloadAll = useCallback(() => {
    downloadAll(files);
  }, [downloadAll, files]);

  const handleApplyGlobalResize = useCallback(() => {
    applyGlobalResizeToAll(globalResizeSettings);
  }, [applyGlobalResizeToAll, globalResizeSettings]);

  const handleApplyGlobalImageSettings = useCallback(() => {
    // Apply both global quality and resize settings to all images
    files.forEach(file => {
      if (!file.isVideo) {
        updateFile(file.id, {
          quality: quality,
          resizeSettings: { ...globalResizeSettings, enabled: false } // Reset individual settings
        });
      }
    });
  }, [files, quality, globalResizeSettings, updateFile]);

  const handleApplyGlobalVideo = useCallback(() => {
    // Apply global video settings to all video files and reset individual settings
    files.forEach(file => {
      if (file.isVideo) {
        updateFileVideoSettings(file.id, { ...globalVideoSettings, enabled: false });
      }
    });
  }, [files, globalVideoSettings, updateFileVideoSettings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Header />

        <UploadArea onFilesSelected={addFiles} />

        {files.length > 0 && (
          <ConversionSettings
            files={files}
            quality={quality}
            onQualityChange={setQuality}
            globalResizeSettings={globalResizeSettings}
            onGlobalResizeChange={handleGlobalResizeChange}
            globalVideoSettings={globalVideoSettings}
            onGlobalVideoChange={setGlobalVideoSettings}
            onApplyGlobalResizeToAll={handleApplyGlobalResize}
            onApplyGlobalImageSettingsToAll={handleApplyGlobalImageSettings}
            onApplyGlobalVideoToAll={handleApplyGlobalVideo}
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
            onUpdateVideoSettings={updateFileVideoSettings}
            onUpdateFile={updateFile}
          />
        )}

        <InfoCard />

        <Footer />
      </div>
    </div>
  );
}

export default App;