import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useUpload } from '../hooks/useUpload';
import { FileRecord } from '../types/file.types';

interface Props {
  onUploaded: (file: FileRecord) => void;
  dark?: boolean;
}

export function FileUpload({ onUploaded, dark = true }: Props) {
  const { upload, status, progress, errorMsg, reset } = useUpload(onUploaded);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isUploading = status === 'uploading';

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { upload(file); e.target.value = ''; }
  };

  const dropzone = dark
    ? `border-gray-700 hover:border-blue-600 hover:bg-gray-800/50 ${dragging ? 'border-blue-500 bg-blue-950/30' : ''}`
    : `border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 ${dragging ? 'border-blue-400 bg-blue-50' : ''}`;

  return (
    <div className="w-full">
      <div
        data-cy="upload-dropzone"
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 ${dropzone} ${isUploading ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleChange} data-cy="upload-input" />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className={`font-medium ${dark ? 'text-blue-400' : 'text-blue-600'}`}>Enviando... {progress}%</div>
            <div className={`w-full max-w-xs rounded-full h-1.5 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className={`w-10 h-10 ${dark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className={`font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
              Arraste um arquivo ou <span className="text-blue-400 underline">clique para selecionar</span>
            </p>
            <p className={`text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}>JPG, PNG ou PDF — máximo 10MB</p>
          </div>
        )}
      </div>

      {status === 'success' && (
        <div data-cy="upload-success" className="mt-3 flex items-center justify-between bg-green-950/50 border border-green-800 text-green-400 rounded-lg px-4 py-2 text-sm">
          <span>✓ Upload realizado com sucesso!</span>
          <button onClick={reset} className="text-green-600 hover:text-green-400 ml-3">✕</button>
        </div>
      )}
      {status === 'error' && errorMsg && (
        <div data-cy="upload-error" className="mt-3 flex items-center justify-between bg-red-950/50 border border-red-800 text-red-400 rounded-lg px-4 py-2 text-sm">
          <span>✕ {errorMsg}</span>
          <button onClick={reset} className="text-red-600 hover:text-red-400 ml-3">✕</button>
        </div>
      )}
    </div>
  );
}