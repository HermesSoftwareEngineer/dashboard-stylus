import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../../utils/metrics';

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f97316', '#f59e0b', '#ef4444', '#6366f1'];

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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

export default function RescissionChart({ data, isPrint = false }) {
  const isAnimationActive = !isPrint;
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-neutral-500 text-sm">
        Sem dados de garantias para o período
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={110}
            innerRadius={40}
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

      {/* Legenda detalhada */}
      <div className="w-full space-y-2 mt-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-gray-500 dark:text-neutral-400">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900 dark:text-neutral-100">{item.value}</span>
              <span className="text-gray-400 dark:text-neutral-500 w-10 text-right">
                {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
