import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  maxSizeMB?: number; // Default 300MB
  title?: string;
  subtitle?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = true,
  maxSizeMB = 300,
  title = "Drag & drop files here, or click to browse",
  subtitle = "Supports files up to 300MB"
}) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        const errorMsg = fileRejections[0].errors[0]?.message || "File validation failed.";
        alert(`File upload error: ${errorMsg}`);
      }
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize: maxSizeBytes,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
        isDragActive
          ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
          : isDragReject
          ? 'border-red-500 bg-red-500/10'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/80'
      }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          isDragActive ? 'bg-brand-500 text-white' : 'bg-slate-800 text-brand-500 border border-slate-700'
        }`}>
          {isDragReject ? (
            <AlertCircle className="h-8 w-8 text-red-400" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </div>

        <div>
          <p className="text-lg font-semibold text-white">
            {isDragActive ? "Drop your files now..." : title}
          </p>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
          <File className="h-3.5 w-3.5" />
          <span>Maximum upload limit: {maxSizeMB}MB</span>
        </div>
      </div>
    </div>
  );
};
