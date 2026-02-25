import { useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';
import { usePropertiesData } from '../hooks/usePropertiesData';
import { formatCurrency, formatNumber } from '../utils/metrics';
import { computePropertyKPIs } from '../utils/propertiesMetrics';
import ImoveisUpload from './ImoveisUpload';
import PropertiesDestinationChart from './Charts/PropertiesDestinationChart';
import PropertiesScoreChart from './Charts/PropertiesScoreChart';

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

function PropertiesSection({ title, data, kpis, isPrint }) {
  const destinationData = [
    { name: 'Residencial', value: kpis.destination.Residencial },
    { name: 'Comercial', value: kpis.destination.Comercial },
    { name: 'Misto', value: kpis.destination.Misto },
  ];
  const scoreData = [
    { name: '0–49', value: kpis.scoreBands.incompleto, color: '#ef4444' },
    { name: '50–69', value: kpis.scoreBands.medio, color: '#f59e0b' },
    { name: '70–89', value: kpis.scoreBands.bom, color: '#22c55e' },
    { name: '90–100', value: kpis.scoreBands.muitoBom, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-neutral-100">{title}</h2>
        <span className="text-xs text-gray-400 dark:text-neutral-500">
          {data.length > 0 ? `${formatNumber(data.length)} imóveis` : 'Sem dados carregados'}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 text-sm text-gray-400 dark:text-neutral-500">
          Importe a planilha de {title.toLowerCase()} para visualizar os indicadores.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard
              title="Total de imóveis anunciados"
              value={formatNumber(kpis.total)}
              subtitle={`Anúncios de ${title.toLowerCase()}`}
            />
            <StatCard
              title="VGV total dos anúncios"
              value={formatCurrency(kpis.vgvTotal)}
            />
            <StatCard
              title="Base carregada"
              value={formatNumber(data.length)}
              subtitle="Imóveis na planilha"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SectionCard
              title="Distribuição por destinação"
              subtitle="Residencial, Comercial e Misto"
            >
              <PropertiesDestinationChart data={destinationData} isPrint={isPrint} />
            </SectionCard>

            <SectionCard
              title="Qualidade dos anúncios (Score)"
              subtitle="Faixas de pontuação"
            >
              <PropertiesScoreChart data={scoreData} isPrint={isPrint} />
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}

export default function ImoveisDashboard({ isPrint = false }) {
  const { propertiesRent, propertiesSale } = useContracts();
  const { startDate, endDate } = usePropertiesData();
  const hasRent = propertiesRent.length > 0;
  const hasSale = propertiesSale.length > 0;

  const rentKpis = useMemo(
    () => computePropertyKPIs(propertiesRent, startDate, endDate, { advertisedOnly: true }),
    [propertiesRent, startDate, endDate]
  );
  const saleKpis = useMemo(
    () => computePropertyKPIs(propertiesSale, startDate, endDate),
    [propertiesSale, startDate, endDate]
  );

  return (
    <div className="space-y-8">
      {!isPrint && <ImoveisUpload showRent={!hasRent} showSale={!hasSale} />}

      <PropertiesSection
        title="Aluguel"
        data={propertiesRent}
        kpis={rentKpis}
        isPrint={isPrint}
      />

      <PropertiesSection
        title="Venda"
        data={propertiesSale}
        kpis={saleKpis}
        isPrint={isPrint}
      />
    </div>
  );
}
