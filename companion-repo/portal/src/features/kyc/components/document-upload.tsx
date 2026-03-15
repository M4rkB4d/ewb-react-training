// src/features/kyc/components/document-upload.tsx
import { useState, useRef, useId } from 'react';
import { Button } from '@/components/ui/button';

interface DocumentUploadProps {
  label: string;
  accept: string;
  maxSizeMB: number;
  onUpload: (file: File) => void;
}

export function DocumentUpload({ label, accept, maxSizeMB, onUpload }: DocumentUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file == null) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map((t) => t.trim());
    if (!allowedTypes.some((type) => file.type === type || file.name.endsWith(type))) {
      setError('Invalid file type');
      return;
    }

    setError(null);
    onUpload(file);
  };

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium">{label}</label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="mt-1"
        aria-describedby={error != null ? errorId : undefined}
      />
      {error != null && (
        <p id={errorId} className="mt-1 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Maximum file size: {maxSizeMB}MB. Accepted formats: {accept}
      </p>
    </div>
  );
}
