import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { FilePreview } from './components/FilePreview';
import { useFiles } from './hooks/useFiles';
import { FileRecord } from './types/file.types';

function Dashboard() {
  const { user, logout } = useAuth();
  const { files, loading, error, removeFile, refetch } = useFiles();
  const [selected, setSelected] = useState<FileRecord | null>(null);
  const [dark, setDark] = useState(true);

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este arquivo?')) await removeFile(id);
  };

  const bg = dark ? 'bg-gray-950' : 'bg-gray-100';
  const headerBg = dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const label = dark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-200`}>
      <header className={`${headerBg} border-b`}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-lg font-bold leading-none ${dark ? 'text-white' : 'text-gray-900'}`}>FileLocker</h1>
              <p className={`text-xs mt-0.5 ${label}`}>{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setDark(!dark)}
              className={`p-2 rounded-lg transition-colors ${dark ? 'text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'}`}
              title={dark ? 'Tema claro' : 'Tema escuro'}
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${dark ? 'text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        <section>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${label}`}>Upload</h2>
          <FileUpload onUploaded={() => refetch()} dark={dark} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${label}`}>Seus arquivos</h2>
            {files.length > 0 && (
              <span className={`text-xs rounded-full px-2 py-0.5 ${dark ? 'text-gray-600 bg-gray-800' : 'text-gray-400 bg-gray-200'}`}>
                {files.length}
              </span>
            )}
          </div>
          <FileList files={files} loading={loading} error={error} onSelect={setSelected} onDelete={handleDelete} dark={dark} />
        </section>
      </main>

      <FilePreview file={selected} onClose={() => setSelected(null)} dark={dark} />
    </div>
  );
}

function AuthGate() {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  if (isAuthenticated) return <Dashboard />;
  if (showRegister) return <RegisterPage onSwitch={() => setShowRegister(false)} />;
  return <LoginPage onSwitch={() => setShowRegister(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}