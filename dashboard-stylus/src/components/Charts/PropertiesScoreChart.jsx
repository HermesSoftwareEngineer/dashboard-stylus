import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatNumber } from '../../utils/metrics';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-700 dark:text-neutral-200">{name}</p>
      <p className="text-gray-500 dark:text-neutral-400 mt-1">
        Quantidade: <span className="font-bold text-gray-900 dark:text-neutral-100">{formatNumber(value)}</span>
      </p>
    </div>
  );
};

export default function PropertiesScoreChart({ data, isPrint = false, onChartClick }) {
  const isAnimationActive = !isPrint;
  const total = data?.reduce((sum, item) => sum + item.value, 0) ?? 0;

  if (!data?.length || total === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400 dark:text-neutral-500 text-sm">
        Sem dados de pontuação para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
        onClick={() => {
          if (!isPrint && onChartClick) onChartClick();
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="name"
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
        <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={isAnimationActive}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color || '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
