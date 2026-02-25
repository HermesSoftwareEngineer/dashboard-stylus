import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../../utils/metrics';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

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

export default function PropertiesDestinationChart({ data, isPrint = false, onChartClick }) {
  const isAnimationActive = !isPrint;
  const total = data?.reduce((sum, item) => sum + item.value, 0) ?? 0;

  if (!data?.length || total === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400 dark:text-neutral-500 text-sm">
        Sem dados de destinação para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart
        onClick={() => {
          if (!isPrint && onChartClick) onChartClick();
        }}
      >
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={35}
          dataKey="value"
          stroke="none"
          isAnimationActive={isAnimationActive}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
