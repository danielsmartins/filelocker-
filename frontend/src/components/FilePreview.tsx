import { FileRecord } from '../types/file.types';

interface Props {
  file: FileRecord | null;
  onClose: () => void;
  dark: boolean; // Adicionado aqui
}

export function FilePreview({ file, onClose, dark }: Props) {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  // Configuração dinâmica das cores baseada no tema escuro/claro
  const modalBg = dark ? 'bg-gray-900 border border-gray-800' : 'bg-white';
  const headerBorder = dark ? 'border-gray-800' : 'border-gray-100';
  const textColor = dark ? 'text-gray-100' : 'text-gray-800';
  const contentBg = dark ? 'bg-gray-950' : 'bg-gray-50';
  
  const iconBgPdf = dark ? 'bg-red-900/30' : 'bg-red-100';
  const iconTextPdf = dark ? 'text-red-400' : 'text-red-600';
  const iconBgImg = dark ? 'bg-blue-900/30' : 'bg-blue-100';
  const iconTextImg = dark ? 'text-blue-400' : 'text-blue-600';
  
  const closeButton = dark 
    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100';
    
  const downloadButton = dark
    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  return (
    <div
      data-cy="preview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`${modalBg} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${headerBorder}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? iconBgPdf : iconBgImg}`}>
              <span className={`text-xs font-bold ${isPdf ? iconTextPdf : iconTextImg}`}>
                {isPdf ? 'PDF' : 'IMG'}
              </span>
            </div>
            <p className={`font-semibold truncate ${textColor}`} data-cy="preview-filename">{file.name}</p>
          </div>
          <button
            data-cy="preview-close"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${closeButton}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-auto flex items-center justify-center p-6 transition-colors duration-200 ${contentBg}`}>
          {isImage && (
            <img
              data-cy="preview-image"
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-[60vh] object-contain rounded-lg shadow"
            />
          )}

          {isPdf && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${iconBgPdf}`}>
                <span className={`font-bold text-2xl ${iconTextPdf}`}>PDF</span>
              </div>
              <div>
                <p className={`font-medium text-lg mb-1 ${textColor}`}>{file.name}</p>
                <p className="text-gray-400 text-sm mb-6">Clique abaixo para abrir ou baixar o PDF</p>
                <div className="flex gap-3 justify-center">
                  <a
                    data-cy="preview-pdf-open"
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Abrir PDF
                  </a>
                  <a
                    data-cy="preview-pdf-download"
                    href={file.url}
                    download={file.name}
                    className={`inline-flex items-center gap-2 font-medium px-5 py-2.5 rounded-lg transition-colors ${downloadButton}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}