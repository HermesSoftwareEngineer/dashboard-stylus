import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../../utils/metrics';

const cumulativeGradientId = 'cumulativeGradient';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload.reduce((acc, item) => {
    acc[item.dataKey] = item.value;
    return acc;
  }, {});

  return (
    <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-gray-700 dark:text-neutral-200 mb-2">{label}</p>
      <div className="space-y-1">
        <p className="text-gray-500 dark:text-neutral-400">
          Ocorrências: <span className="font-semibold text-gray-900 dark:text-neutral-100">{formatNumber(data.count || 0)}</span>
        </p>
        <p className="text-gray-500 dark:text-neutral-400">
          Acumulado: <span className="font-semibold text-gray-900 dark:text-neutral-100">{(data.cumulative || 0).toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
};

export default function AtendimentosParetoChart({ data, isPrint = false, onChartClick }) {
  const isAnimationActive = !isPrint;
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-neutral-500 text-sm">
        Sem dados de descarte para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        onClick={() => {
          if (!isPrint && onChartClick) onChartClick();
        }}
      >
        <defs>
          <linearGradient id={cumulativeGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="reason"
          tick={{ fontSize: 10, fill: 'currentColor' }}
          className="text-gray-400 dark:text-neutral-500"
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-gray-400 dark:text-neutral-500"
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-gray-400 dark:text-neutral-500"
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          yAxisId="left"
          dataKey="count"
          name="Ocorrências"
          fill="#f59e0b"
          radius={[6, 6, 0, 0]}
          isAnimationActive={isAnimationActive}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="cumulative"
          name="Acumulado"
          stroke="none"
          fill={`url(#${cumulativeGradientId})`}
          isAnimationActive={isAnimationActive}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulative"
          name="Acumulado"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={isAnimationActive}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
