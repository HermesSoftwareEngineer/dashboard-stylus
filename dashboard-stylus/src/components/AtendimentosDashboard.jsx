import { useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';
import { useAtendimentosData } from '../hooks/useAtendimentosData';
import { formatNumber, formatPercent, computeMonthlyData } from '../utils/metrics';
import { getDateRange } from '../utils/dateRange';
import AtendimentosUpload from './AtendimentosUpload';
import AtendimentosFunnelChart from './Charts/AtendimentosFunnelChart';
import AtendimentosOriginChart from './Charts/AtendimentosOriginChart';
import AtendimentosParetoChart from './Charts/AtendimentosParetoChart';
import AtendimentosTimelineChart from './Charts/AtendimentosTimelineChart';

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm dark:shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      <p className="text-xs font-medium text-red-600 dark:text-red-300 uppercase tracking-wide mb-1">
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-neutral-100 leading-tight">
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm dark:shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>}
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

export default function AtendimentosDashboard({ isPrint = false, onOpenDetails }) {
  const { atendimentosRent, atendimentosSale, propertiesRent, propertiesSale, contracts, filter, atendimentosFilter } = useContracts();
  const { metrics, timeline } = useAtendimentosData();

  const hasRent = atendimentosRent.length > 0;
  const hasSale = atendimentosSale.length > 0;
  const hasContracts = contracts.length > 0;

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

  // Mescla timeline de atendimentos com novos contratos (se disponível)
  const mergedTimeline = useMemo(() => {
    if (!hasContracts || !timeline?.length) return timeline;

    // Calcula contratos mensais usando o filtro de atendimentos para alinhar o período
    const { startDate, endDate } = getDateRange(atendimentosFilter);
    const granularityMap = { day: 'daily', week: 'weekly', month: 'monthly', quarter: 'monthly', year: 'monthly', auto: 'auto' };
    const contractsGranularity = granularityMap[atendimentosFilter?.granularity || 'auto'] || 'auto';
    const contractsMonthly = computeMonthlyData(contracts, startDate, endDate, contractsGranularity);

    // Cria mapa de key normalizado → novos contratos
    // timeline usa key como "yyyy-MM", contracts usa key como "yyyy-MM" nos periods internos
    // mas computeMonthlyData retorna apenas o label (month). Precisamos reconstruir a chave pela data.
    // Alternativa: indexar contracts por label e converter o label do timeline para o mesmo formato.
    // Como os formatos diferem (MMM yyyy vs MMM/yy), vamos usar a data do timeline para gerar a chave.
    const contractsMap = new Map();
    contractsMonthly.forEach((item) => {
      // Normaliza o label removendo espaços/barras para criar uma chave de comparação
      contractsMap.set(item.month.toLowerCase().trim(), item.novos);
    });

    // Mescla nos dados de timeline usando a data para gerar o mesmo formato de label do contracts
    return timeline.map((item) => {
      let novos = 0;
      if (item.date) {
        // Gera o label no formato que computeMonthlyData usa (depende da granularidade)
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          // Tenta formatos: dd/MM (daily), dd/MM - dd/MM (weekly), MMM/yy (monthly)
          const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          const yy = String(d.getFullYear()).slice(2);
          const mm = months[d.getMonth()];
          const dd = String(d.getDate()).padStart(2, '0');
          const mo = String(d.getMonth() + 1).padStart(2, '0');

          // Tenta monthly: "mmm/yy"
          const monthlyKey = `${mm}/${yy}`;
          // Tenta daily: "dd/mm"
          const dailyKey = `${dd}/${mo}`;

          novos = contractsMap.get(monthlyKey) ?? contractsMap.get(dailyKey) ?? 0;
        }
      }
      return { ...item, novosContratos: novos };
    });
  }, [timeline, contracts, hasContracts, atendimentosFilter]);

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
        <AtendimentosFunnelChart
          data={metrics.funnelStages}
          isPrint={isPrint}
          onChartClick={
            onOpenDetails
              ? () =>
                  onOpenDetails({
                    type: 'atendimentos',
                    title: 'Atendimentos',
                    rows: metrics?.filtered || [
                      ...atendimentosRent,
                      ...atendimentosSale,
                    ],
                  })
              : undefined
          }
        />
      </SectionCard>

      <SectionCard
        title="Evolução de novos atendimentos"
        subtitle={hasContracts ? 'Atendimentos vs. novos contratos no período' : 'Comparativo entre aluguel e venda'}
      >
        <AtendimentosTimelineChart
          data={mergedTimeline}
          showContracts={hasContracts}
          isPrint={isPrint}
          onChartClick={
            onOpenDetails
              ? () =>
                  onOpenDetails({
                    type: 'atendimentos',
                    title: 'Atendimentos',
                    rows: metrics?.filtered || [
                      ...atendimentosRent,
                      ...atendimentosSale,
                    ],
                  })
              : undefined
          }
        />
      </SectionCard>

      <SectionCard
        title="Origem dos Atendimentos"
        subtitle="Distribuição por canal e conversão"
      >
        <AtendimentosOriginChart
          data={metrics.originData}
          isPrint={isPrint}
          onChartClick={
            onOpenDetails
              ? () =>
                  onOpenDetails({
                    type: 'atendimentos',
                    title: 'Atendimentos',
                    rows: metrics?.filtered || [
                      ...atendimentosRent,
                      ...atendimentosSale,
                    ],
                  })
              : undefined
          }
        />
      </SectionCard>

      <SectionCard
        title="Top 10 Imóveis Mais Procurados"
        subtitle="Cliques, leads e visitas"
      >
        {metrics.topImoveis?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 dark:text-neutral-500 text-left border-b border-gray-200 dark:border-neutral-800">
                  <th className="py-2 pr-2">Imóvel</th>
                  <th className="py-2 pr-2">Endereço</th>
                  <th className="py-2 pr-2">Cliques</th>
                  <th className="py-2 pr-2">Leads</th>
                  <th className="py-2">Visitas</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topImoveis.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200/70 dark:border-neutral-800/70 last:border-0">
                    <td className="py-2 pr-2 text-gray-700 dark:text-neutral-200 font-medium">#{row.id}</td>
                    <td className="py-2 pr-2 text-gray-500 dark:text-neutral-400">
                      {addressMap.get(String(row.id)) || 'Endereço não encontrado'}
                    </td>
                    <td className="py-2 pr-2 text-gray-600 dark:text-neutral-300">{formatNumber(row.clicks)}</td>
                    <td className="py-2 pr-2 text-gray-600 dark:text-neutral-300">{formatNumber(row.leads)}</td>
                    <td className="py-2 text-gray-600 dark:text-neutral-300">{formatNumber(row.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-400 dark:text-neutral-500">Sem dados de imóveis no período.</div>
        )}
      </SectionCard>

      <SectionCard
        title="Principais Motivos de Descarte"
        subtitle="Pareto de gargalos comerciais"
      >
        <AtendimentosParetoChart
          data={metrics.paretoData}
          isPrint={isPrint}
          onChartClick={
            onOpenDetails
              ? () =>
                  onOpenDetails({
                    type: 'atendimentos',
                    title: 'Atendimentos',
                    rows: metrics?.filtered || [
                      ...atendimentosRent,
                      ...atendimentosSale,
                    ],
                  })
              : undefined
          }
        />
      </SectionCard>
    </div>
  );
}
