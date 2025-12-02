import React, { useState, useRef } from 'react';
import { uploadFile } from '../api/slicerApi';

function FileUpload({ onFileUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileInput = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type
    const allowedExtensions = ['.stl', '.obj', '.3mf'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload an STL, OBJ, or 3MF file.');
      return;
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Maximum size is 100MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadFile(file);

      // Create a blob URL for the 3D viewer
      const blob = URL.createObjectURL(file);

      onFileUpload(result, blob);
    } catch (err) {
      setError(err.message || 'Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-bambu-primary bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.obj,.3mf"
          onChange={handleFileInput}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <svg
              className="animate-spin h-12 w-12 mx-auto text-bambu-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-600">Uploading file...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">📁</div>
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {isDragging ? 'Drop your file here' : 'Upload 3D Model'}
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop or click to select
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Supported formats: STL, OBJ, 3MF (Max 100MB)
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
