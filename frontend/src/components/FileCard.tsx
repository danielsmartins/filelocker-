import { FileRecord } from '../types/file.types';

interface Props {
  file: FileRecord;
  onSelect: (file: FileRecord) => void;
  onDelete: (id: string) => void;
  dark?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function FileCard({ file, onSelect, onDelete, dark = true }: Props) {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const typeLabel = isPdf ? 'PDF' : 'Imagem';

  const cardBg = dark ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm';
  const nameCls = dark ? 'text-gray-100' : 'text-gray-800';
  const metaCls = dark ? 'text-gray-500' : 'text-gray-400';
  const thumbBg = dark ? 'bg-gray-800' : 'bg-gray-100';
  const actionCls = dark
    ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-950/40'
    : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50';
  const deleteCls = dark
    ? 'text-gray-500 hover:text-red-400 hover:bg-red-950/40'
    : 'text-gray-400 hover:text-red-500 hover:bg-red-50';

  return (
    <div data-cy="file-card" className={`border rounded-xl overflow-hidden transition-colors ${cardBg}`}>
      {/* Thumbnail */}
      {isImage && (
        <div className={`w-full h-36 ${thumbBg} cursor-pointer overflow-hidden`} onClick={() => onSelect(file)} data-cy="file-card-select">
          <img src={file.url} alt={file.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      {isPdf && (
        <div className={`w-full h-36 ${thumbBg} cursor-pointer flex items-center justify-center`} onClick={() => onSelect(file)} data-cy="file-card-select">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-red-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-bold text-red-400 tracking-widest">PDF</span>
          </div>
        </div>
      )}

      {/* Info row */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(file)}>
          <p className={`font-medium truncate text-sm ${nameCls}`} data-cy="file-name">{file.name}</p>
          <p className={`text-xs mt-0.5 ${metaCls}`}>
            <span data-cy="file-type">{typeLabel}</span> · {formatSize(file.size)} · <span data-cy="file-date">{formatDate(file.createdAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Download — both images and PDFs */}
          <a
            href={file.url}
            download={file.name}
            onClick={(e) => e.stopPropagation()}
            className={`p-1.5 rounded-lg transition-colors ${actionCls}`}
            title="Download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
          {/* Delete */}
          <button
            data-cy="file-delete"
            onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
            className={`p-1.5 rounded-lg transition-colors ${deleteCls}`}
            title="Excluir"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}