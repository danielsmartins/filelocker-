import axios from 'axios';
import { FileRecord } from '../types/file.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('filelocker_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('filelocker_token');
      localStorage.removeItem('filelocker_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  register: (email: string, password: string) =>
    api.post<{ access_token: string; user: { id: string; email: string } }>(
      '/auth/register', { email, password }
    ).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: { id: string; email: string } }>(
      '/auth/login', { email, password }
    ).then((r) => r.data),
};

export const filesApi = {
  upload: (file: File, onProgress?: (pct: number) => void): Promise<FileRecord> => {
    const form = new FormData();
    form.append('file', file);
    return api.post<FileRecord>('/files/upload', form, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }).then((r) => r.data);
  },
  list: (): Promise<FileRecord[]> => api.get<FileRecord[]>('/files').then((r) => r.data),
  remove: (id: string) => api.delete(`/files/${id}`).then((r) => r.data),
};