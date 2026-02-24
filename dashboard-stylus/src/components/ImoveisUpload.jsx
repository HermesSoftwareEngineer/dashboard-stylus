import { useRef, useState } from 'react';
import { useContracts } from '../context/ContractsContext';
import { parseExcelFile } from '../utils/parseExcel';

function UploadCard({ title, description, onSelect }) {
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
      onSelect(data);
    } catch (err) {
      setError(err.message || 'Erro ao processar o arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={[
        'bg-neutral-900 rounded-xl border p-5 shadow-[0_0_0_1px_rgba(24,24,27,0.6)] transition-colors',
        isDragging ? 'border-red-500/70 bg-neutral-900/90' : 'border-neutral-800',
      ].join(' ')}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0];
        processFile(file);
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-red-300 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium px-3 py-2 rounded-lg border border-neutral-800 text-neutral-200 hover:bg-neutral-800/60 transition-colors"
        >
          Importar
        </button>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 w-full border border-dashed border-neutral-700 rounded-lg py-6 text-xs text-neutral-400 hover:border-red-500/60 hover:text-neutral-200 transition-colors"
      >
        Arraste e solte o arquivo aqui ou clique para selecionar
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => processFile(e.target.files[0])}
        className="hidden"
      />

      {isLoading && (
        <p className="text-xs text-neutral-400 mt-3">Processando planilha…</p>
      )}
      {error && (
        <p className="text-xs text-red-300 mt-3">{error}</p>
      )}
    </div>
  );
}

export default function ImoveisUpload({ showRent = true, showSale = true }) {
  const { setPropertiesRent, setPropertiesSale } = useContracts();

  if (!showRent && !showSale) return null;

  return (
    <div
      className={[
        'grid gap-4',
        showRent && showSale ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1',
      ].join(' ')}
    >
      {showRent && (
        <UploadCard
          title="Planilha de imóveis (Aluguel)"
          description="Importe a base de anúncios de aluguel"
          onSelect={setPropertiesRent}
        />
      )}
      {showSale && (
        <UploadCard
          title="Planilha de imóveis (Venda)"
          description="Importe a base de anúncios de venda"
          onSelect={setPropertiesSale}
        />
      )}
    </div>
  );
}
