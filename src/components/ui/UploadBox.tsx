import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloudIcon, FileIcon, XIcon, Loader2Icon } from 'lucide-react';
import { Button } from './Button';
interface UploadBoxProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
}
export const UploadBox: React.FC<UploadBoxProps> = ({
  onFileSelect,
  acceptedFileTypes = 'application/pdf,image/*',
  maxFileSizeMB = 5,
  label = 'Upload a file',
  disabled = false,
  className = '',
  isUploading = false,
  uploadProgress = 0,
  selectedFile = null,
  onRemoveFile
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };
  const handleFileSelect = (file: File) => {
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSizeMB) {
      alert(`File size exceeds ${maxFileSizeMB}MB limit.`);
      return;
    }
    // Check file type
    const fileType = file.type;
    const acceptedTypes = acceptedFileTypes.split(',');
    const isAccepted = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return fileType.startsWith(type.split('*')[0]);
      }
      return type === fileType;
    });
    if (!isAccepted) {
      alert('File type not accepted.');
      return;
    }
    onFileSelect(file);
  };
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return <div className={`w-full ${className}`}>
      <input type="file" ref={fileInputRef} className="hidden" accept={acceptedFileTypes} onChange={handleFileInputChange} disabled={disabled || isUploading} />
      {!selectedFile ? <motion.div initial={{
      opacity: 0.9
    }} animate={{
      opacity: 1,
      borderColor: isDragging ? '#3b82f6' : '#e5e7eb',
      backgroundColor: isDragging ? '#eff6ff' : '#ffffff'
    }} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleButtonClick}>
          <div className="flex flex-col items-center justify-center space-y-3">
            <UploadCloudIcon className="h-10 w-10 text-gray-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-500">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Max file size: {maxFileSizeMB}MB
              </p>
            </div>
          </div>
        </motion.div> : <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {isUploading ? <div className="flex items-center">
                <Loader2Icon className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div> : <Button variant="outline" size="sm" onClick={onRemoveFile} className="p-1 rounded-full hover:bg-gray-100" disabled={disabled}>
                <XIcon className="h-4 w-4 text-gray-500" />
              </Button>}
          </div>
          {isUploading && <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
              <motion.div initial={{
          width: 0
        }} animate={{
          width: `${uploadProgress}%`
        }} className="bg-blue-500 h-1.5 rounded-full" />
            </div>}
        </motion.div>}
    </div>;
};