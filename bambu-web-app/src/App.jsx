import { useState, useCallback, useMemo } from 'react';
import ModelViewer from './components/ModelViewer';
import FileUpload from './components/FileUpload';
import SettingsPanel from './components/SettingsPanel';
import GcodePreview from './components/GcodePreview';
import { parseModelFile, calculateBoundingBox } from './utils/fileParser';
import { sliceModel, defaultSettings } from './utils/slicer';
import { downloadGcode, download3MF } from './utils/exportUtils';
import './App.css';

function App() {
  // State
  const [modelFile, setModelFile] = useState(null);
  const [geometry, setGeometry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({ ...defaultSettings });
  const [isSlicing, setIsSlicing] = useState(false);
  const [sliceResult, setSliceResult] = useState(null);
  const [view, setView] = useState('model'); // 'model' | 'preview'
  const [error, setError] = useState(null);
  
  // Calculate model info
  const modelInfo = useMemo(() => {
    if (!geometry || !geometry.vertices) return null;
    const bounds = calculateBoundingBox(geometry.vertices);
    return {
      triangles: geometry.triangleCount,
      size: bounds.size,
      center: bounds.center
    };
  }, [geometry]);
  
  // Handle file upload
  const handleFileLoaded = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setSliceResult(null);
    setView('model');
    
    try {
      const parsedGeometry = await parseModelFile(file);
      
      // Center the model on the bed
      const bounds = calculateBoundingBox(parsedGeometry.vertices);
      const centerX = settings.bedSizeX / 2;
      const centerY = settings.bedSizeY / 2;
      const modelCenterX = bounds.center.x;
      const modelCenterY = bounds.center.y;
      const offsetX = centerX - modelCenterX;
      const offsetY = centerY - modelCenterY;
      const offsetZ = -bounds.min.z;
      
      // Apply offset to vertices
      const newVertices = new Float32Array(parsedGeometry.vertices.length);
      for (let i = 0; i < parsedGeometry.vertices.length; i += 3) {
        newVertices[i] = parsedGeometry.vertices[i] + offsetX;
        newVertices[i + 1] = parsedGeometry.vertices[i + 1] + offsetY;
        newVertices[i + 2] = parsedGeometry.vertices[i + 2] + offsetZ;
      }
      
      setGeometry({
        ...parsedGeometry,
        vertices: newVertices
      });
      setModelFile(file);
    } catch (err) {
      setError(err.message);
      console.error('Error loading model:', err);
    } finally {
      setIsLoading(false);
    }
  }, [settings.bedSizeX, settings.bedSizeY]);
  
  // Handle slicing
  const handleSlice = useCallback(async () => {
    if (!geometry) return;
    
    setIsSlicing(true);
    setError(null);
    
    try {
      // Run slicing in next tick to allow UI update
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = await sliceModel(geometry, settings);
      setSliceResult(result);
      setView('preview');
    } catch (err) {
      setError(`Slicing failed: ${err.message}`);
      console.error('Slicing error:', err);
    } finally {
      setIsSlicing(false);
    }
  }, [geometry, settings]);
  
  // Handle G-code download
  const handleDownloadGcode = useCallback(() => {
    if (!sliceResult) return;
    const filename = modelFile ? modelFile.name.replace(/\.[^.]+$/, '.gcode') : 'print.gcode';
    downloadGcode(sliceResult.gcode, filename);
  }, [sliceResult, modelFile]);
  
  // Handle 3MF download
  const handleDownload3MF = useCallback(async () => {
    if (!sliceResult || !geometry) return;
    const filename = modelFile ? modelFile.name.replace(/\.[^.]+$/, '.3mf') : 'print.3mf';
    await download3MF(geometry, sliceResult.gcode, settings, filename);
  }, [sliceResult, geometry, settings, modelFile]);
  
  // Handle back from preview
  const handleBackToModel = useCallback(() => {
    setView('model');
  }, []);
  
  // Clear model
  const handleClearModel = useCallback(() => {
    setModelFile(null);
    setGeometry(null);
    setSliceResult(null);
    setView('model');
    setError(null);
  }, []);
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>
            <span className="logo-icon">🎋</span>
            Bambu Web Slicer
          </h1>
        </div>
        {modelFile && view === 'model' && (
          <button className="clear-button" onClick={handleClearModel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </header>
      
      {error && (
        <div className="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {view === 'preview' && sliceResult ? (
        <GcodePreview
          gcode={sliceResult.gcode}
          stats={sliceResult.stats}
          bedSize={[settings.bedSizeX, settings.bedSizeY]}
          onClose={handleBackToModel}
          onDownload={handleDownloadGcode}
          onDownload3MF={handleDownload3MF}
        />
      ) : (
        <main className="app-main">
          <div className="viewer-container">
            {geometry ? (
              <ModelViewer 
                geometry={geometry}
                bedSize={[settings.bedSizeX, settings.bedSizeY]}
                showBuildPlate={true}
              />
            ) : (
              <FileUpload 
                onFileLoaded={handleFileLoaded}
                isLoading={isLoading}
              />
            )}
            
            {modelInfo && (
              <div className="model-info">
                <div className="info-item">
                  <span className="info-label">Triangles</span>
                  <span className="info-value">{modelInfo.triangles.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size</span>
                  <span className="info-value">
                    {modelInfo.size.x.toFixed(1)} × {modelInfo.size.y.toFixed(1)} × {modelInfo.size.z.toFixed(1)} mm
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {geometry && (
            <div className="settings-container">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                isSlicing={isSlicing}
                onSlice={handleSlice}
              />
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
