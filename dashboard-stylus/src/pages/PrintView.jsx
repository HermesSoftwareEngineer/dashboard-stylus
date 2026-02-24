import { useEffect, useState, useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';
import { useContractsData } from '../hooks/useContractsData';
import { getDateRange } from '../utils/dateRange';
import { computeKPIs, computeMonthlyData, computeGuaranteeData } from '../utils/metrics';
import ImoveisDashboard from '../components/ImoveisDashboard';
import AtendimentosDashboard from '../components/AtendimentosDashboard';
import ContractsChart from '../components/Charts/ContractsChart';
import FinancialChart from '../components/Charts/FinancialChart';
import RescissionChart from '../components/Charts/RescissionChart';
import DashboardCards from '../components/DashboardCards';

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
        {subtitle && (
          <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function PrintView() {
  const {
    loadDataFromStorage,
    contracts,
    propertiesRent,
    propertiesSale,
    atendimentosRent,
    atendimentosSale,
    filter
  } = useContracts();

  const [loaded, setLoaded] = useState(false);
  
  const hasData = contracts?.length > 0;
  const hasProperties = propertiesRent?.length > 0 || propertiesSale?.length > 0;
  const hasAtendimentos = atendimentosRent?.length > 0 || atendimentosSale?.length > 0;

  // Calcula dados diretamente (sem hook) para garantir que está sincronizado
  const { startDate, endDate } = useMemo(() => getDateRange(filter), [filter]);
  const kpis = useMemo(() => computeKPIs(contracts, startDate, endDate), [contracts, startDate, endDate]);
  const monthlyData = useMemo(() => computeMonthlyData(contracts, startDate, endDate, filter.granularity || 'auto'), [contracts, startDate, endDate, filter.granularity]);
  const guaranteeData = useMemo(() => computeGuaranteeData(contracts, startDate, endDate), [contracts, startDate, endDate]);

  useEffect(() => {
    // Não adiciona classe que possa triggerar print automático
    console.log('=== PrintView Inicializado ===');
    console.log('window.opener disponível?', !!window.opener);
    
    // 2. Tenta carregar dados IMEDIATAMENTE
    let success = loadDataFromStorage();
    console.log('Primeira tentativa:', success ? '✓' : '✗');
    
    // 3. Se falhou, tenta novamente com delays
    let retries = 0;
    const maxRetries = 3;
    const retryInterval = setInterval(() => {
      retries++;
      if (retries > maxRetries) {
        clearInterval(retryInterval);
        console.error('✗ Falha em carregar dados após', maxRetries, 'tentativas');
        setLoaded(true); // Renderiza mesmo sem dados para mostrar mensagem
        return;
      }
      
      console.log(`Tentativa ${retries} de ${maxRetries}...`);
      success = loadDataFromStorage();
      if (success) {
        console.log(`✓ Dados carregados na tentativa ${retries}`);
        clearInterval(retryInterval);
      }
    }, 300);

    // 4. Renderiza após um delay para garantir que estado foi propagado
    const renderTimer = setTimeout(() => {
      console.log('Renderizando. Estado atual:', {
        contracts: contracts?.length ?? 0,
        monthlyData: monthlyData?.length ?? 0,
        guaranteeData: guaranteeData?.length ?? 0,
        hasData
      });
      setLoaded(true);
    }, 1000);

    return () => {
      clearInterval(retryInterval);
      clearTimeout(renderTimer);
    };
  }, []); // Run only once on mount

  useEffect(() => {
    // Quando dados mudarem, log para debug
    if (hasData) {
      console.log('Dados atualizados no contexto:', {
        contracts: contracts?.length,
        monthlyData: monthlyData?.length,
        guaranteeData: guaranteeData?.length
      });
    }
  }, [hasData, contracts?.length, monthlyData?.length, guaranteeData?.length]);

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="print-view bg-neutral-950 min-h-screen">
      <section className="print-slide">
        <div className="print-title">Relatório de Contratos</div>
        {hasData ? (
          <div className="space-y-6">
            <DashboardCards kpis={kpis} />
            <div className="grid grid-cols-1 gap-6">
              <ChartCard title="Produção Contratual" subtitle="Novos contratos vs. Rescisões por mês">
                <ContractsChart data={monthlyData} isPrint />
              </ChartCard>
              <ChartCard title="Evolução Financeira" subtitle="VGL para Stylus vs. Valor Rescindido (R$)">
                <FinancialChart data={monthlyData} isPrint />
              </ChartCard>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <ChartCard title="Garantias Utilizadas" subtitle="Distribuição dos tipos de garantia nos novos contratos">
                <RescissionChart data={guaranteeData} isPrint />
              </ChartCard>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Sem dados de contratos.</p>
        )}
      </section>

      <section className="print-slide">
        <div className="print-title">Relatório de Imóveis</div>
        {hasProperties ? (
          <ImoveisDashboard isPrint />
        ) : (
          <p className="text-sm text-neutral-500">Sem dados de imóveis.</p>
        )}
      </section>

      <section className="print-slide">
        <div className="print-title">Relatório de Atendimentos</div>
        {hasAtendimentos ? (
          <AtendimentosDashboard isPrint />
        ) : (
          <p className="text-sm text-neutral-500">Sem dados de atendimentos.</p>
        )}
      </section>
    </div>
  );
}
