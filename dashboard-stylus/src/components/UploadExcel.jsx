import { useRef, useState } from 'react';
import { useContracts } from '../context/ContractsContext';
import { parseExcelFile } from '../utils/parseExcel';

export default function UploadExcel() {
  const { setContracts } = useContracts();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    if (!file.name.match(/\.(xls|xlsx)$/i)) {
      setError('Formato inválido. Selecione um arquivo .xls ou .xlsx');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await parseExcelFile(file);

      if (!data.length) {
        setError('A planilha está vazia ou não contém dados válidos.');
        return;
      }

      setContracts(data);
    } catch (err) {
      setError(err.message || 'Erro ao processar o arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => processFile(e.target.files[0]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.02]'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-700',
        ].join(' ')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Processando planilha…
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 dark:bg-blue-900/40">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Importar Planilha de Contratos
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm leading-relaxed">
              Arraste e solte seu arquivo aqui, ou clique para selecionar
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                .XLS
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                .XLSX
              </span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 w-full max-w-2xl flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center max-w-md">
        Os dados são processados localmente no seu navegador. Nenhuma informação é enviada para servidores externos.
      </p>
    </div>
  );
}
