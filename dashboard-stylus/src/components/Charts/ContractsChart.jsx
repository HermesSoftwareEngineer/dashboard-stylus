import {
  ComposedChart,
  Bar,
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
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ContractsChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500 text-sm">
        Sem dados para o período selecionado
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-slate-500 dark:text-slate-400"
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          formatter={(value) => (
            <span className="text-slate-600 dark:text-slate-400">{value}</span>
          )}
        />
        <Bar
          dataKey="novos"
          name="Novos Contratos"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Line
          type="monotone"
          dataKey="rescisoes"
          name="Rescisões"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
