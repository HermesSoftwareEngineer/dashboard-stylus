import {
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../../utils/metrics';

const atendimentosGradientId = 'atendimentosGradient';
const contratosGradientId = 'contratosGradient';

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

export default function AtendimentosTimelineChart({
  data,
  showContracts = false,
  isPrint = false,
  onChartClick,
}) {
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
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        onClick={() => {
          if (!isPrint && onChartClick) onChartClick();
        }}
      >
        <defs>
          <linearGradient id={atendimentosGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
          {showContracts && (
            <linearGradient id={contratosGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="label"
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
        {showContracts && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-gray-400 dark:text-neutral-500"
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          formatter={(value) => (
            <span className="text-gray-500 dark:text-neutral-400">{value}</span>
          )}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="total"
          name="Atendimentos"
          stroke="none"
          fill={`url(#${atendimentosGradientId})`}
          isAnimationActive={isAnimationActive}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="total"
          name="Atendimentos"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={isAnimationActive}
        />
        {showContracts && (
          <>
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="novosContratos"
              name="Novos Contratos"
              stroke="none"
              fill={`url(#${contratosGradientId})`}
              isAnimationActive={isAnimationActive}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="novosContratos"
              name="Novos Contratos"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={isAnimationActive}
            />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
