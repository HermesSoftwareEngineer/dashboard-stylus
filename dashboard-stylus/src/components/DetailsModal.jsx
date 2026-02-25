import { useEffect } from 'react';
import { formatCurrency, formatNumber, parseContractDate } from '../utils/metrics';

function formatDate(value) {
  const d = parseContractDate(value);
  if (!d) return value || '';
  try {
    return d.toLocaleDateString('pt-BR');
  } catch {
    return String(value ?? '');
  }
}

function getFirstNonEmpty(row, keys) {
  for (const key of keys) {
    if (row[key] != null && row[key] !== '') return row[key];
  }
  return '';
}

function buildColumns(type) {
  if (type === 'contracts') {
    return [
      {
        id: 'codigo',
        label: 'Código',
        value: (row) =>
          getFirstNonEmpty(row, [
            'CodigoContrato',
            'CódigoContrato',
            'Codigo',
            'Código',
            'CodContrato',
            'Cod. Contrato',
          ]),
      },
      {
        id: 'imovel',
        label: 'Imóvel',
        value: (row) =>
          getFirstNonEmpty(row, [
            'Imoveis',
            'Imóveis',
            'Imovel',
            'Imóvel',
            'CodigoImovel',
            'CódigoImovel',
            'CodImovel',
            'Cod. Imóvel',
          ]),
      },
      {
        id: 'inquilino',
        label: 'Inquilino',
        value: (row) =>
          getFirstNonEmpty(row, [
            'LocatarioNome',
            'LocatárioNome',
            'Inquilino',
            'Locatario',
            'Locatário',
            'Cliente',
            'NomeInquilino',
          ]),
      },
      {
        id: 'locador',
        label: 'Locador',
        value: (row) =>
          getFirstNonEmpty(row, [
            'Locador',
            'Proprietario',
            'Proprietário',
            'NomeLocador',
            'Proprietarios',
            'Proprietários',
          ]),
      },
      {
        id: 'inicio',
        label: 'Data Início',
        value: (row) =>
          formatDate(
            getFirstNonEmpty(row, ['DataInicio', 'Data Início', 'DataAtivacao', 'DataInclusao']),
          ),
      },
      {
        id: 'garantia',
        label: 'Garantia',
        value: (row) =>
          getFirstNonEmpty(row, [
            'FormaGarantia',
            'Forma Garantia',
            'TipoGarantia',
            'Tipo Garantia',
            'Garantia',
          ]),
      },
      {
        id: 'valor',
        label: 'Valor Aluguel',
        value: (row) => {
          const raw = getFirstNonEmpty(row, ['ValorAluguel', 'Valor', 'Aluguel', 'ValorLocacao']);
          if (typeof raw === 'number') return formatCurrency(raw);
          return raw || '';
        },
      },
    ];
  }

  if (type === 'properties') {
    return [
      {
        id: 'codigo',
        label: 'Código',
        value: (row) =>
          getFirstNonEmpty(row, [
            'Codigo',
            'Código',
            'CodigoImovel',
            'CódigoImovel',
            'CodImovel',
            'Cod. Imóvel',
          ]),
      },
      {
        id: 'endereco',
        label: 'Endereço',
        value: (row) => {
          const street =
            getFirstNonEmpty(row, ['Endereco', 'Endereço', 'Logradouro'])?.toString().trim() || '';
          const number =
            getFirstNonEmpty(row, ['EnderecoNumero', 'Número', 'Numero'])?.toString().trim() || '';
          if (!street && !number) return '';
          return number ? `${street}, ${number}` : street;
        },
      },
      {
        id: 'locador',
        label: 'Locador',
        value: (row) =>
          getFirstNonEmpty(row, [
            'Proprietarios',
            'Proprietários',
            'Locador',
            'Proprietario',
            'Proprietário',
            'Cliente',
            'DonoImovel',
          ]),
      },
      {
        id: 'valor',
        label: 'Valor',
        value: (row) => {
          const raw = getFirstNonEmpty(row, ['Valor', 'ValorAluguel', 'ValorLocacao', 'ValorVenda']);
          if (typeof raw === 'number') return formatCurrency(raw);
          return raw || '';
        },
      },
      {
        id: 'situacao',
        label: 'Situação',
        value: (row) =>
          getFirstNonEmpty(row, [
            'Situacao',
            'Situação',
            'Status',
            'SituacaoImovel',
            'Situação Imóvel',
          ]),
      },
    ];
  }

  if (type === 'atendimentos') {
    return [
      {
        id: 'codigo',
        label: 'Código',
        value: (row) =>
          getFirstNonEmpty(row, [
            'CodigoAtendimento',
            'CódigoAtendimento',
            'Codigo',
            'Código',
            'CodAtendimento',
          ]),
      },
      {
        id: 'cliente',
        label: 'Cliente',
        value: (row) =>
          getFirstNonEmpty(row, [
            'ClienteNome',
            'Cliente',
            'NomeCliente',
            'Nome do Cliente',
            'Interessado',
          ]),
      },
      {
        id: 'contato',
        label: 'Contato',
        value: (row) =>
          getFirstNonEmpty(row, [
            'ClienteTelefone',
            'Telefone',
            'Celular',
            'Contato',
            'Telefone1',
            'Telefone2',
            'Whatsapp',
          ]),
      },
      {
        id: 'imoveis',
        label: 'Imóveis interessados',
        value: (row) =>
          getFirstNonEmpty(row, [
            'ImoveisInteresse',
            'ImoveisCarrinho',
            'ImoveisVisita',
            'ImoveisProposta',
          ]),
      },
      {
        id: 'endereco',
        label: 'Endereço',
        value: (row) =>
          getFirstNonEmpty(row, [
            'PerfilBairros',
            'PerfilRegioes',
            'PerfilCidades',
            'Endereco',
            'Endereço',
            'Bairro',
            'Cidade',
            'UF',
          ]),
      },
      {
        id: 'data',
        label: 'Data inclusão',
        value: (row) =>
          formatDate(
            getFirstNonEmpty(row, [
              'DataInclusao',
              'Data Inclusao',
              'DataCadastro',
              'DataHoraInclusao',
            ]),
          ),
      },
    ];
  }

  return [];
}

export default function DetailsModal({ open, onClose, type, title, subtitle, rows }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const safeRows = Array.isArray(rows) ? rows : [];
  const columns = buildColumns(type);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 max-w-6xl w-[95vw] max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
              {title || 'Detalhes'}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-2 text-xs text-gray-500 dark:text-neutral-400 flex items-center justify-between">
          <span>
            {safeRows.length > 0
              ? `${formatNumber(safeRows.length)} registros encontrados`
              : 'Nenhum registro encontrado para o período atual.'}
          </span>
        </div>

        <div className="flex-1 overflow-auto px-5 pb-4">
          <div className="overflow-x-auto border border-gray-200 dark:border-neutral-800 rounded-xl">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 dark:bg-neutral-900">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="px-3 py-2 text-left font-medium text-gray-500 dark:text-neutral-400 whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length || 1}
                      className="px-3 py-4 text-center text-gray-400 dark:text-neutral-500"
                    >
                      Nenhum registro para exibir.
                    </td>
                  </tr>
                ) : (
                  safeRows.map((row, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-100 dark:border-neutral-800 hover:bg-gray-50/80 dark:hover:bg-neutral-900/60"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className="px-3 py-2 text-gray-700 dark:text-neutral-200 whitespace-nowrap max-w-xs truncate"
                          title={String(col.value(row) ?? '')}
                        >
                          {col.value(row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

