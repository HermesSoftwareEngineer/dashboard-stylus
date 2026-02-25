import { useEffect, useRef, useState } from 'react';
import { useContracts } from '../context/ContractsContext';
import { useContractsData } from '../hooks/useContractsData';
import { parseExcelFile } from '../utils/parseExcel';
import Filters from '../components/Filters';
import ImoveisFilters from '../components/ImoveisFilters';
import AtendimentosFilters from '../components/AtendimentosFilters';
import DashboardCards from '../components/DashboardCards';
import UploadExcel from '../components/UploadExcel';
import ImoveisDashboard from '../components/ImoveisDashboard';
import AtendimentosDashboard from '../components/AtendimentosDashboard';
import ContractsChart from '../components/Charts/ContractsChart';
import FinancialChart from '../components/Charts/FinancialChart';
import RescissionChart from '../components/Charts/RescissionChart';
import ThemeToggle from '../components/ThemeToggle';

// ─── Chart Card wrapper ────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-5 shadow-sm dark:shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Dashboard principal ───────────────────────────────────────────────────────

export default function Dashboard({ isDark, toggleTheme }) {
  const {
    contracts,
    setContracts,
    propertiesRent,
    propertiesSale,
    atendimentosRent,
    atendimentosSale,
    saveDataToStorage
  } = useContracts();
  const { kpis, monthlyData, guaranteeData } = useContractsData();
  const fileInputRef = useRef(null);
  const hasData = contracts.length > 0;
  const [activeTab, setActiveTab] = useState('contratos');
  const hasProperties = propertiesRent.length > 0 || propertiesSale.length > 0;
  const hasAtendimentos = atendimentosRent.length > 0 || atendimentosSale.length > 0;

  const handleReimport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await parseExcelFile(file);
      setContracts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    document.body.classList.remove('print-slides');
    // Força layout de impressão antes de chamar o dialog
    window.print();
  };

  const handlePrintSlides = () => {
    // 1. Salva estado atual para o localStorage
    saveDataToStorage();

    // 2. Abre nova janela que lerá esse estado e renderizará os slides
    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      `${window.location.origin}?view=print`,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  };

  useEffect(() => {
    const cleanup = () => document.body.classList.remove('print-slides');
    window.addEventListener('afterprint', cleanup);
    return () => window.removeEventListener('afterprint', cleanup);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 transition-colors duration-200">
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-30 backdrop-blur print-hide">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo-stylus.jpg" alt="Stylus Imobiliária" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-neutral-100">Stylus</span>
              <span className="text-sm font-medium text-red-500 dark:text-red-400 ml-1">Imobiliária</span>
              <span className="text-xs text-gray-400 dark:text-neutral-400 ml-2">Dashboard</span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V4h12v5M6 18h12v2H6v-2zm0-6h12v4H6v-4zm-2 0h2m12 0h2" />
              </svg>
              Imprimir
            </button>
            <button
              onClick={handlePrintSlides}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M5 9h14M7 13h10M9 17h6" />
              </svg>
              Imprimir Slides
            </button>
            {activeTab === 'contratos' && hasData && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-900 rounded-full px-2.5 py-1 border border-gray-200 dark:border-neutral-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {contracts.length} contratos
                </span>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800/60 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="hidden sm:inline">Nova Planilha</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleReimport}
                  className="hidden"
                />
              </>
            )}

          </div>
        </div>
      </header>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="px-4 lg:px-6 pt-4 print-hide">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-1">
          <button
            onClick={() => setActiveTab('contratos')}
            className={[
              'px-4 py-1.5 text-xs font-semibold rounded-full transition-colors',
              activeTab === 'contratos'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800',
            ].join(' ')}
          >
            Contratos
          </button>
          <button
            onClick={() => setActiveTab('imoveis')}
            className={[
              'px-4 py-1.5 text-xs font-semibold rounded-full transition-colors',
              activeTab === 'imoveis'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800',
            ].join(' ')}
          >
            Imóveis
          </button>
          <button
            onClick={() => setActiveTab('atendimentos')}
            className={[
              'px-4 py-1.5 text-xs font-semibold rounded-full transition-colors',
              activeTab === 'atendimentos'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-800',
            ].join(' ')}
          >
            Atendimentos
          </button>
        </div>
      </div>

      {/* ── Filtros (sticky, apenas com dados) ────────────────────── */}
      <div className="print-hide">
        {activeTab === 'contratos' && hasData && <Filters />}
        {activeTab === 'imoveis' && <ImoveisFilters />}
        {activeTab === 'atendimentos' && <AtendimentosFilters />}
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────── */}
      <main className="px-4 lg:px-6 py-6 max-w-screen-2xl mx-auto">
        {activeTab === 'contratos' && (
          !hasData ? (
            <UploadExcel />
          ) : (
            <div className="space-y-6">
              {/* KPI Cards */}
              <DashboardCards kpis={kpis} />

              {/* Gráficos — linha 1 */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ChartCard
                  title="Produção Contratual"
                  subtitle="Novos contratos vs. Rescisões por mês"
                >
                  <ContractsChart data={monthlyData} />
                </ChartCard>

                <ChartCard
                  title="Evolução Financeira"
                  subtitle="VGL gerado vs. valor rescindido (R$)"
                >
                  <FinancialChart data={monthlyData} />
                </ChartCard>
              </div>

              {/* Gráfico pizza de garantias */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <ChartCard
                  title="Garantias Utilizadas"
                  subtitle="Distribuição dos tipos de garantia nos novos contratos"
                >
                  <RescissionChart data={guaranteeData} />
                </ChartCard>

                {/* Resumo Rescisões */}
                <ChartCard
                  title="Resumo de Rescisões"
                  subtitle="Indicadores do período selecionado"
                >
                  <div className="space-y-3 pt-1">
                    {[
                      { label: 'Contratos rescindidos', value: kpis.rescisoes, type: 'number' },
                      { label: 'Valor total rescindido', value: kpis.valorRescisoes, type: 'currency' },
                      { label: 'Ticket médio rescisão', value: kpis.ticketMedioRescisoes, type: 'currency' },
                      { label: 'Cauções recebidas', value: kpis.caucoesRecebidas, type: 'currency' },
                      { label: 'Cauções devolvidas', value: kpis.caucoesDev, type: 'currency' },
                      { label: 'Churn financeiro', value: kpis.churn, type: 'percent' },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-2 border-b border-gray-200/70 dark:border-neutral-800/70 last:border-0"
                      >
                        <span className="text-sm text-gray-500 dark:text-neutral-400">{row.label}</span>
                        <span className={`text-sm font-semibold ${row.type === 'percent' && kpis.churn > 5
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-gray-900 dark:text-neutral-100'
                          }`}>
                          {row.type === 'currency'
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.value)
                            : row.type === 'percent'
                              ? `${row.value.toFixed(2)}%`
                              : new Intl.NumberFormat('pt-BR').format(row.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                {/* Resumo Produção */}
                <ChartCard
                  title="Resumo de Produção"
                  subtitle="Indicadores do período selecionado"
                >
                  <div className="space-y-3 pt-1">
                    {[
                      { label: 'Novos contratos', value: kpis.novosContratos, type: 'number' },
                      { label: 'VGL gerado', value: kpis.vgl, type: 'currency' },
                      { label: 'Ticket médio (novos)', value: kpis.ticketMedio, type: 'currency' },
                      { label: 'Caução', value: `${kpis.caucao} (${kpis.caucaoPercent.toFixed(1)}%)`, type: 'text' },
                      { label: 'Seguro Fiança', value: `${kpis.seguroFianca} (${kpis.seguroFiancaPercent.toFixed(1)}%)`, type: 'text' },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-2 border-b border-gray-200/70 dark:border-neutral-800/70 last:border-0"
                      >
                        <span className="text-sm text-gray-500 dark:text-neutral-400">{row.label}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                          {row.type === 'currency'
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.value)
                            : row.type === 'number'
                              ? new Intl.NumberFormat('pt-BR').format(row.value)
                              : row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </div>
          )
        )}

        {activeTab === 'imoveis' && <ImoveisDashboard />}

        {activeTab === 'atendimentos' && <AtendimentosDashboard />}

        {/* ── Print slides (todos os relatórios) ─────────────────── */}
        <div className="print-only">
          <section className="print-slide">
            <div className="print-title">Relatório de Contratos</div>
            {hasData ? (
              <div className="space-y-6">
                <DashboardCards kpis={kpis} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <ChartCard title="Produção Contratual" subtitle="Novos contratos vs. Rescisões por mês">
                    <ContractsChart data={monthlyData} />
                  </ChartCard>
                  <ChartCard title="Evolução Financeira" subtitle="VGL gerado vs. valor rescindido (R$)">
                    <FinancialChart data={monthlyData} />
                  </ChartCard>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <ChartCard title="Garantias Utilizadas" subtitle="Distribuição dos tipos de garantia nos novos contratos">
                    <RescissionChart data={guaranteeData} />
                  </ChartCard>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-neutral-500">Sem dados de contratos.</p>
            )}
          </section>

          <section className="print-slide">
            <div className="print-title">Relatório de Imóveis</div>
            {hasProperties ? (
              <ImoveisDashboard />
            ) : (
              <p className="text-sm text-gray-400 dark:text-neutral-500">Sem dados de imóveis.</p>
            )}
          </section>

          <section className="print-slide">
            <div className="print-title">Relatório de Atendimentos</div>
            {hasAtendimentos ? (
              <AtendimentosDashboard />
            ) : (
              <p className="text-sm text-gray-400 dark:text-neutral-500">Sem dados de atendimentos.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
