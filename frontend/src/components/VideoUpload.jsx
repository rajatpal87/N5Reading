import { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function VideoUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Allowed video formats
  const ALLOWED_TYPES = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/webm'];
  const ALLOWED_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  // Validate file
  const validateFile = (file) => {
    // Check file type
    const isValidType = ALLOWED_TYPES.includes(file.type);
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidType && !isValidExt) {
      return 'Invalid file type. Only MP4, AVI, MOV, MKV, and WEBM videos are allowed.';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/videos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      console.log('Upload successful:', response.data);
      
      // Reset state
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.video);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload video. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileInputChange}
          disabled={uploading}
        />

        <div className="space-y-3">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Upload Text */}
          <div>
            <p className="text-base font-medium text-gray-700">
              Drop video or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              MP4, AVI, MOV • Max 100MB
            </p>
          </div>

          {/* Selected File Info */}
          {selectedFile && !uploading && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-left">
              <p className="text-xs font-medium text-gray-700">Selected:</p>
              <p className="text-xs text-gray-600 mt-0.5 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-gray-700">Uploading...</p>
            <p className="text-xs font-medium text-gray-700">{uploadProgress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          className="
            mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium
            py-2.5 px-4 rounded-lg transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            text-sm
          "
          disabled={uploading}
        >
          Upload Video
        </button>
      )}
    </div>
  );
}

