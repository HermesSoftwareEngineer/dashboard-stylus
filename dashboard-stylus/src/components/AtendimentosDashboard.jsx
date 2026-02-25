import { useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';
import { useAtendimentosData } from '../hooks/useAtendimentosData';
import { formatNumber, formatPercent } from '../utils/metrics';
import AtendimentosUpload from './AtendimentosUpload';
import AtendimentosFunnelChart from './Charts/AtendimentosFunnelChart';
import AtendimentosOriginChart from './Charts/AtendimentosOriginChart';
import AtendimentosParetoChart from './Charts/AtendimentosParetoChart';
import AtendimentosTimelineChart from './Charts/AtendimentosTimelineChart';

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      <p className="text-xs font-medium text-red-300 uppercase tracking-wide mb-1">
        {title}
      </p>
      <p className="text-2xl font-bold text-neutral-100 leading-tight">
        {value}
      </p>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function decodeHtml(value) {
  if (value == null) return '';
  const str = String(value);
  if (!str.includes('&')) return str;
  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    return doc.documentElement.textContent || '';
  }
  return str.replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

function formatAddress(item) {
  if (!item) return 'Endereço não encontrado';
  const street = decodeHtml(item.Endereco || '').trim();
  const number = decodeHtml(item.EnderecoNumero || '').trim();
  if (!street && !number) return 'Endereço não encontrado';
  return number ? `${street}, ${number}` : street;
}

export default function AtendimentosDashboard({ isPrint = false }) {
  const { atendimentosRent, atendimentosSale, propertiesRent, propertiesSale } = useContracts();
  const { metrics, timeline } = useAtendimentosData();

  const hasRent = atendimentosRent.length > 0;
  const hasSale = atendimentosSale.length > 0;

  const addressMap = useMemo(() => {
    const map = new Map();
    [...propertiesRent, ...propertiesSale].forEach((item) => {
      const key = String(item.Codigo || '').trim();
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, formatAddress(item));
      }
    });
    return map;
  }, [propertiesRent, propertiesSale]);

  return (
    <div className="space-y-6">
      {!isPrint && <AtendimentosUpload showRent={!hasRent} showSale={!hasSale} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Taxa de conversão geral"
          value={formatPercent(metrics.conversionRate, 1)}
          subtitle="Negócios fechados sobre leads"
        />
        <StatCard
          title="Leads"
          value={formatNumber(metrics.funnelStages?.[0]?.value || 0)}
        />
        <StatCard
          title="Negócios fechados"
          value={formatNumber(metrics.funnelStages?.[4]?.value || 0)}
        />
      </div>

      <SectionCard
        title="Funil de Performance Comercial"
        subtitle="Leads, qualificados, visitas, propostas e fechamentos"
      >
        <AtendimentosFunnelChart data={metrics.funnelStages} isPrint={isPrint} />
      </SectionCard>

      <SectionCard
        title="Evolução de novos atendimentos"
        subtitle="Comparativo entre aluguel e venda"
      >
        <AtendimentosTimelineChart data={timeline} isPrint={isPrint} />
      </SectionCard>

      <SectionCard
        title="Origem dos Atendimentos"
        subtitle="Distribuição por canal e conversão"
      >
        <AtendimentosOriginChart data={metrics.originData} isPrint={isPrint} />
      </SectionCard>

      <SectionCard
        title="Top 10 Imóveis Mais Procurados"
        subtitle="Cliques, leads e visitas"
      >
        {metrics.topImoveis?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-neutral-500 text-left border-b border-neutral-800">
                  <th className="py-2 pr-2">Imóvel</th>
                  <th className="py-2 pr-2">Endereço</th>
                  <th className="py-2 pr-2">Cliques</th>
                  <th className="py-2 pr-2">Leads</th>
                  <th className="py-2">Visitas</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topImoveis.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-800/70 last:border-0">
                    <td className="py-2 pr-2 text-neutral-200 font-medium">#{row.id}</td>
                    <td className="py-2 pr-2 text-neutral-400">
                      {addressMap.get(String(row.id)) || 'Endereço não encontrado'}
                    </td>
                    <td className="py-2 pr-2 text-neutral-300">{formatNumber(row.clicks)}</td>
                    <td className="py-2 pr-2 text-neutral-300">{formatNumber(row.leads)}</td>
                    <td className="py-2 text-neutral-300">{formatNumber(row.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-neutral-500">Sem dados de imóveis no período.</div>
        )}
      </SectionCard>

      <SectionCard
        title="Principais Motivos de Descarte"
        subtitle="Pareto de gargalos comerciais"
      >
        <AtendimentosParetoChart data={metrics.paretoData} isPrint={isPrint} />
      </SectionCard>
    </div>
  );
}
