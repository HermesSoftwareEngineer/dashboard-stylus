import { useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';

const PERIODS = [
  { value: 'today', label: 'Este dia' },
  { value: 'yesterday', label: 'Dia anterior' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_week', label: 'Semana anterior' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês anterior' },
  { value: 'this_quarter', label: 'Este trimestre' },
  { value: 'last_quarter', label: 'Trimestre anterior' },
  { value: 'this_year', label: 'Este ano' },
  { value: 'last_year', label: 'Ano anterior' },
  { value: 'custom', label: 'Personalizado' },
];

function decodeHtml(value) {
  if (value == null) return '';
  const str = String(value);
  if (!str.includes('&')) return str;
  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    return doc.documentElement.textContent || '';
  }
  return str.replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

export default function AtendimentosFilters() {
  const { atendimentosRent, atendimentosSale, atendimentosFilter, updateAtendimentosFilter } = useContracts();

  const collaborators = useMemo(() => {
    const set = new Set();
    [...atendimentosRent, ...atendimentosSale].forEach((item) => {
      const name = decodeHtml(item.Corretor || '').trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [atendimentosRent, atendimentosSale]);

  const handlePeriod = (value) => {
    updateAtendimentosFilter({ period: value, startDate: '', endDate: '' });
  };

  const handleCollaborator = (value) => {
    updateAtendimentosFilter({ collaborator: value });
  };

  const handlePurpose = (value) => {
    updateAtendimentosFilter({ purpose: value });
  };

  return (
    <div className="bg-black border-b border-neutral-800 px-4 lg:px-6 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-wide text-red-300 font-semibold">
          Seletor de período
        </label>
        <select
          value={atendimentosFilter.period}
          onChange={(e) => handlePeriod(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <label className="text-xs uppercase tracking-wide text-red-300 font-semibold ml-2">
          Colaborador
        </label>
        <select
          value={atendimentosFilter.collaborator}
          onChange={(e) => handleCollaborator(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
        >
          <option value="todos">Todos</option>
          {collaborators.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <label className="text-xs uppercase tracking-wide text-red-300 font-semibold ml-2">
          Finalidade
        </label>
        <select
          value={atendimentosFilter.purpose}
          onChange={(e) => handlePurpose(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
        >
          <option value="todos">Todos</option>
          <option value="aluguel">Aluguel</option>
          <option value="venda">Venda</option>
        </select>
      </div>

      {atendimentosFilter.period === 'custom' && (
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium text-red-300">De:</span>
            <input
              type="date"
              value={atendimentosFilter.startDate || ''}
              onChange={(e) => updateAtendimentosFilter({ startDate: e.target.value })}
              className="px-2 py-1 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium text-red-300">Até:</span>
            <input
              type="date"
              value={atendimentosFilter.endDate || ''}
              onChange={(e) => updateAtendimentosFilter({ endDate: e.target.value })}
              className="px-2 py-1 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </label>
        </div>
      )}
    </div>
  );
}
