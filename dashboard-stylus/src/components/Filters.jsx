import { useContracts } from '../context/ContractsContext';

const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_week', label: 'Semana anterior' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês anterior' },
  { value: 'this_quarter', label: 'Este trimestre' },
  { value: 'last_quarter', label: 'Trimestre anterior' },
  { value: 'this_year', label: 'Este ano' },
  { value: 'last_year', label: 'Ano anterior' },
  { value: 'custom', label: 'Personalizado' },
  { value: 'all', label: 'Todos' },
];

const GRANULARITIES = [
  { value: 'auto', label: 'Automático' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
];

export default function Filters() {
  const { filter, updateFilter } = useContracts();

  const handlePeriod = (value) => {
    updateFilter({ period: value, startDate: '', endDate: '' });
  };

  return (
    <div className="bg-black border-b border-neutral-800 px-4 lg:px-6 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-wide text-red-300 font-semibold">
          Seletor de período
        </label>
        <select
          value={filter.period}
          onChange={(e) => handlePeriod(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <label className="text-xs uppercase tracking-wide text-neutral-400 font-semibold ml-4">
          Granularidade
        </label>
        <select
          value={filter.granularity || 'auto'}
          onChange={(e) => updateFilter({ granularity: e.target.value })}
          className="px-3 py-2 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
        >
          {GRANULARITIES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {/* Inputs de data para período personalizado */}
      {filter.period === 'custom' && (
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium text-red-300">De:</span>
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => updateFilter({ startDate: e.target.value })}
              className="px-2 py-1 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium text-red-300">Até:</span>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => updateFilter({ endDate: e.target.value })}
              className="px-2 py-1 text-xs rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-600"
            />
          </label>
        </div>
      )}
    </div>
  );
}
