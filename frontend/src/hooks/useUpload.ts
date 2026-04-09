import { useState } from 'react';
import { filesApi } from '../services/api';
import { FileRecord, UploadStatus } from '../types/file.types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

export function useUpload(onSuccess: (file: FileRecord) => void) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const upload = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Tipo não permitido. Use JPG, PNG ou PDF.');
      setStatus('error');
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrorMsg('Arquivo muito grande. Máximo: 10MB.');
      setStatus('error');
      return;
    }

    try {
      setStatus('uploading');
      setErrorMsg(null);
      setProgress(0);
      const result = await filesApi.upload(file, setProgress);
      setStatus('success');
      onSuccess(result);

      // Auto-dismiss after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao fazer upload.';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
      setStatus('error');
    } finally {
      setProgress(0);
    }
  };

  const reset = () => {
    setStatus('idle');
    setErrorMsg(null);
    setProgress(0);
  };

  return { upload, status, progress, errorMsg, reset };
}