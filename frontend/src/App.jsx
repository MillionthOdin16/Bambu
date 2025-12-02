import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import STLViewer from './components/STLViewer';
import SlicerSettings from './components/SlicerSettings';
import { sliceFile } from './api/slicerApi';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [modelSize, setModelSize] = useState(null);
  const [settings, setSettings] = useState({
    printer: 'bambu_a1_mini',
    layerHeight: 0.2,
    infillDensity: 15,
    wallCount: 2,
    topLayers: 4,
    bottomLayers: 3,
    infillPattern: 'grid',
    enableSupport: false,
    nozzleTemp: 220,
    bedTemp: 65,
    nozzleDiameter: 0.4,
    filamentType: 'PLA',
    outerWallSpeed: 100,
    innerWallSpeed: 250,
    infillSpeed: 250,
    topSpeed: 150,
    flowRate: 1.0,
    skirt: 1,
    brimWidth: 0
  });
  const [isSlicing, setIsSlicing] = useState(false);
  const [sliceResult, setSliceResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (file, blob) => {
    setUploadedFile(file);
    setFileBlob(blob);
    setModelSize(null);
    setSliceResult(null);
    setError(null);
  };

  const handleModelLoad = (modelData) => {
    setModelSize(modelData);
  };

  const handleSlice = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first');
      return;
    }

    setIsSlicing(true);
    setError(null);
    setSliceResult(null);

    try {
      const result = await sliceFile(uploadedFile.fileId, settings);
      setSliceResult(result);
    } catch (err) {
      setError(err.message || 'Failed to slice file');
      console.error('Slicing error:', err);
    } finally {
      setIsSlicing(false);
    }
  };

  const handleDownload = () => {
    if (sliceResult && sliceResult.downloadUrl) {
      window.location.href = sliceResult.downloadUrl;
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setFileBlob(null);
    setSliceResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-bambu-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Bambu Web Slicer
              </h1>
            </div>
            {uploadedFile && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Upload Section */}
        {!uploadedFile ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} />

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="text-3xl mb-2">📤</div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload</h3>
                <p className="text-sm text-gray-600">
                  Upload your STL, OBJ, or 3MF file
                </p>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-semibold text-gray-900 mb-1">Configure</h3>
                <p className="text-sm text-gray-600">
                  Adjust slicer settings for your print
                </p>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-1">Slice</h3>
                <p className="text-sm text-gray-600">
                  Generate G-code and download
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview Section */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                3D Preview
              </h2>
              <STLViewer
                fileBlob={fileBlob}
                fileName={uploadedFile.originalName}
                onModelLoad={handleModelLoad}
              />
            </div>

            {/* Settings Section */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Slicer Settings
              </h2>
              <SlicerSettings
                settings={settings}
                onSettingsChange={setSettings}
                modelSize={modelSize}
              />
            </div>

            {/* Slice Button */}
            <div className="card">
              <button
                onClick={handleSlice}
                disabled={isSlicing}
                className="btn-primary w-full"
              >
                {isSlicing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Slicing...
                  </span>
                ) : (
                  'Generate G-code'
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {sliceResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold mb-2">
                    ✅ Slicing complete!
                  </p>
                  <button
                    onClick={handleDownload}
                    className="btn-primary w-full"
                  >
                    Download G-code
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-600">
        <p>Bambu Web Slicer - Lightweight mobile slicer for Bambu Lab printers</p>
      </footer>
    </div>
  );
}

export default App;
