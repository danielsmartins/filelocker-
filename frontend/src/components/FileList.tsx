import { FileRecord } from '../types/file.types';
import { FileCard } from './FileCard';

interface Props {
  files: FileRecord[];
  loading: boolean;
  error: string | null;
  onSelect: (file: FileRecord) => void;
  onDelete: (id: string) => void;
  dark?: boolean;
}

export function FileList({ files, loading, error, onSelect, onDelete, dark = true }: Props) {
  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  if (error) return <div className="text-center py-12 text-red-400"><p>{error}</p></div>;

  if (files.length === 0) return (
    <div data-cy="empty-state" className={`text-center py-16 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
      <svg className={`w-14 h-14 mx-auto mb-3 ${dark ? 'text-gray-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
      <p className={`font-medium ${dark ? 'text-gray-500' : 'text-gray-500'}`}>Nenhum arquivo ainda</p>
      <p className={`text-sm mt-1 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>Faça o upload do seu primeiro arquivo acima</p>
    </div>
  );

  return (
    <div data-cy="file-list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} onSelect={onSelect} onDelete={onDelete} dark={dark} />
      ))}
    </div>
  );
}