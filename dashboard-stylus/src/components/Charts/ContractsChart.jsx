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
import { formatNumber } from '../../utils/metrics';

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
            {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const novosGradientId = 'novosGradient';
const rescisoesGradientId = 'rescisoesGradient';

export default function ContractsChart({ data, isPrint = false }) {
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
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id={novosGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={rescisoesGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
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
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-gray-400 dark:text-neutral-500"
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          formatter={(value) => (
            <span className="text-gray-500 dark:text-neutral-400">{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="novos"
          name="Novos Contratos"
          stroke="#22c55e"
          strokeWidth={2}
          fill={`url(#${novosGradientId})`}
          dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={isAnimationActive}
        />
        <Area
          type="monotone"
          dataKey="rescisoes"
          name="Rescisões"
          stroke="#ef4444"
          strokeWidth={2}
          fill={`url(#${rescisoesGradientId})`}
          dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={isAnimationActive}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
