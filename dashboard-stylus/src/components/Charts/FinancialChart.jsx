import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/metrics';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const vglGradientId = 'vglGradient';
const churnGradientId = 'churnGradient';

export default function FinancialChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500 text-sm">
        Sem dados para o período selecionado
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={vglGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={churnGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'currentColor' }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
        />
        <Area
          type="monotone"
          dataKey="vgl"
          name="VGL (Novos)"
          stroke="#14b8a6"
          strokeWidth={2}
          fill={`url(#${vglGradientId})`}
          dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Area
          type="monotone"
          dataKey="churnValor"
          name="Valor Rescindido"
          stroke="#ef4444"
          strokeWidth={2}
          fill={`url(#${churnGradientId})`}
          dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
