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
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-700 dark:text-neutral-200 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-gray-500 dark:text-neutral-400">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-neutral-100">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const vglGradientId = 'vglGradient';
const churnGradientId = 'churnGradient';

export default function FinancialChart({ data, isPrint = false }) {
  const isAnimationActive = !isPrint;
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-neutral-500 text-sm">
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
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-gray-400 dark:text-neutral-500"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'currentColor' }}
          className="text-gray-400 dark:text-neutral-500"
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
          isAnimationActive={isAnimationActive}
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
          isAnimationActive={isAnimationActive}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
