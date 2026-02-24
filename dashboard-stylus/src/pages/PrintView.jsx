import { useEffect, useState } from 'react';
import { useContracts } from '../context/ContractsContext';
import { useContractsData } from '../hooks/useContractsData';
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
    atendimentosSale
  } = useContracts();

  const { kpis, monthlyData, guaranteeData } = useContractsData();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 1. Aplica classe no body imediatamente
    document.body.classList.add('print-slides');
    
    // 2. Carrega dados
    const success = loadDataFromStorage();
    if (!success) {
      console.warn('Falha ao carregar dados iniciais. Tentando novamente em 500ms...');
      setTimeout(loadDataFromStorage, 500);
    }
    
    // 3. Aguarda renderização dos gráficos (Recharts precisa de tempo para calcular dimensões)
    const timer = setTimeout(() => {
      setLoaded(true);

      // 4. Mais um delay para garantir que o DOM final esteja estável antes de imprimir
      setTimeout(() => {
        window.print();
      }, 3000); 
      
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('print-slides');
    };
  }, []); // Run once on mount

  const hasData = contracts?.length > 0;
  const hasProperties = propertiesRent?.length > 0 || propertiesSale?.length > 0;
  const hasAtendimentos = atendimentosRent?.length > 0 || atendimentosSale?.length > 0;

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p>Prepare-se, gerando slides para impressão...</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 min-h-screen">
      <section className="print-slide">
        <div className="print-title">Relatório de Contratos</div>
        {hasData ? (
          <div className="space-y-6">
            <DashboardCards kpis={kpis} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChartCard title="Produção Contratual" subtitle="Novos contratos vs. Rescisões por mês">
                <ContractsChart data={monthlyData} isPrint />
              </ChartCard>
              <ChartCard title="Evolução Financeira" subtitle="VGL para Stylus vs. Valor Rescindido (R$)">
                <FinancialChart data={monthlyData} isPrint />
              </ChartCard>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
