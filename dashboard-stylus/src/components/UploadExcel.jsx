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
            ? 'border-gray-400 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-900 scale-[1.02]'
            : 'border-gray-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-gray-400 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800/40',
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
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-neutral-300 font-medium">
              Processando planilha…
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <svg className="w-8 h-8 text-gray-500 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">
              Importar Planilha de Contratos
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 mb-4 text-sm leading-relaxed">
              Arraste e solte seu arquivo aqui, ou clique para selecionar
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700">
                .XLS
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700">
                .XLSX
              </span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 w-full max-w-2xl flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-neutral-900 border border-red-200 dark:border-neutral-800">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400 dark:text-neutral-500 text-center max-w-md">
        Os dados são processados localmente no seu navegador. Nenhuma informação é enviada para servidores externos.
      </p>
    </div>
  );
}
