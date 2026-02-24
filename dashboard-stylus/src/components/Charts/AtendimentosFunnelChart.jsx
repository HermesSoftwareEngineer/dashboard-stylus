import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber } from '../../utils/metrics';

const COLORS = ['#22c55e', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444'];

function buildLabels(data) {
  return data.map((item, index) => {
    const prev = index === 0 ? item.value : data[index - 1].value;
    const rate = prev > 0 ? (item.value / prev) * 100 : 0;
    return {
      ...item,
      fill: COLORS[index % COLORS.length],
      rate,
      label: `${item.name} • ${formatNumber(item.value)}${index === 0 ? '' : ` • ${rate.toFixed(1)}%`}`,
    };
  });
}

const CustomLabel = ({ x, y, width, height, value }) => {
  const cx = x + width / 2;
  const cy = y + height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill="#e5e7eb"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {value}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-neutral-200 mb-1">{data.name}</p>
      <p className="text-neutral-400">Quantidade: <span className="font-semibold text-neutral-100">{formatNumber(data.value)}</span></p>
      {data.rate !== undefined && data.rate !== null && (
        <p className="text-neutral-400">Conversão: <span className="font-semibold text-neutral-100">{data.rate.toFixed(1)}%</span></p>
      )}
    </div>
  );
};

export default function AtendimentosFunnelChart({ data, isPrint = false }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-60 text-neutral-500 text-sm">
        Sem dados para o período
      </div>
    );
  }

  const labelData = buildLabels(data);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <FunnelChart>
        <Tooltip content={<CustomTooltip />} />
        <Funnel
          dataKey="value"
          data={labelData}
          isAnimationActive={!isPrint}
          stroke="#0f172a"
          strokeWidth={1}
        >
          <LabelList dataKey="label" position="center" content={<CustomLabel />} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
