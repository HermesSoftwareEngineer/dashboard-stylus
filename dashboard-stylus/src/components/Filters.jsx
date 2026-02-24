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

export default function Filters() {
  const { filter, updateFilter } = useContracts();

  const handlePeriod = (value) => {
    updateFilter({ period: value, startDate: '', endDate: '' });
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-3">
      {/* Linha de botões de período */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriod(p.value)}
            className={[
              'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
              filter.period === p.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Inputs de data para período personalizado */}
      {filter.period === 'custom' && (
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">De:</span>
            <input
              type="date"
              value={filter.startDate || ''}
              onChange={(e) => updateFilter({ startDate: e.target.value })}
              className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Até:</span>
            <input
              type="date"
              value={filter.endDate || ''}
              onChange={(e) => updateFilter({ endDate: e.target.value })}
              className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}
