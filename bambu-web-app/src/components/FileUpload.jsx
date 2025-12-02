import { useRef, useState, useCallback, useMemo } from 'react';
import './FileUpload.css';

const SUPPORTED_FORMATS = ['.stl', '.obj', '.3mf'];

export default function FileUpload({ onFileLoaded, isLoading }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  
  const supportedFormats = useMemo(() => SUPPORTED_FORMATS, []);
  
  const handleFile = useCallback(async (file) => {
    setError(null);
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!supportedFormats.includes(`.${extension}`)) {
      setError(`Unsupported file format. Please use: ${supportedFormats.join(', ')}`);
      return;
    }
    
    try {
      onFileLoaded(file);
    } catch (err) {
      setError(err.message);
    }
  }, [onFileLoaded, supportedFormats]);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);
  
  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);
  
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-dropzone ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(',')}
          onChange={handleInputChange}
          className="file-input"
        />
        
        {isLoading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <span>Loading model...</span>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="upload-text">
              <span className="upload-primary">Tap to upload or drag and drop</span>
              <span className="upload-secondary">STL, OBJ, or 3MF files</span>
            </div>
          </>
        )}
        
        {error && (
          <div className="upload-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
