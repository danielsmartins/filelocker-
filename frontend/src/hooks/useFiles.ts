import { useState, useEffect, useCallback } from 'react';
import { filesApi } from '../services/api';
import { FileRecord } from '../types/file.types';

export function useFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await filesApi.list();
      setFiles(data);
    } catch {
      setError('Erro ao carregar arquivos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const removeFile = async (id: string) => {
    await filesApi.remove(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return { files, loading, error, refetch: fetchFiles, removeFile };
}
