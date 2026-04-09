export interface FileRecord {
  id: string;
  name: string;
  url: string;
  type: string;       // 'image/jpeg' | 'image/png' | 'application/pdf'
  size: number;       // bytes
  createdAt: string;  // ISO 8601
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
