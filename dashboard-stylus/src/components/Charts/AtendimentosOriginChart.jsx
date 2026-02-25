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

const conversionGradientId = 'conversionGradient';

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
          Leads: <span className="font-semibold text-gray-900 dark:text-neutral-100">{formatNumber(data.leads || 0)}</span>
        </p>
        <p className="text-gray-500 dark:text-neutral-400">
          Conversão: <span className="font-semibold text-gray-900 dark:text-neutral-100">{(data.conversion || 0).toFixed(1)}%</span>
        </p>
      </div>
    </div>
  );
};

export default function AtendimentosOriginChart({ data, isPrint = false, onChartClick }) {
  const isAnimationActive = !isPrint;
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-neutral-500 text-sm">
        Sem dados de canais para o período
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
          <linearGradient id={conversionGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="channel"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-gray-400 dark:text-neutral-500"
          axisLine={false}
          tickLine={false}
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
          dataKey="leads"
          name="Leads"
          fill="#22c55e"
          radius={[6, 6, 0, 0]}
          isAnimationActive={isAnimationActive}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="conversion"
          name="Conversão"
          stroke="none"
          fill={`url(#${conversionGradientId})`}
          isAnimationActive={isAnimationActive}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="conversion"
          name="Conversão"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={isAnimationActive}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
