import { useRef } from 'react';
import { useContracts } from '../context/ContractsContext';
import { useContractsData } from '../hooks/useContractsData';
import { parseExcelFile } from '../utils/parseExcel';
import Filters from '../components/Filters';
import DashboardCards from '../components/DashboardCards';
import UploadExcel from '../components/UploadExcel';
import ContractsChart from '../components/Charts/ContractsChart';
import FinancialChart from '../components/Charts/FinancialChart';
import RescissionChart from '../components/Charts/RescissionChart';

// ─── Chart Card wrapper ────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Dashboard principal ───────────────────────────────────────────────────────

export default function Dashboard({ isDark, onToggleDark }) {
  const { contracts, setContracts } = useContracts();
  const { kpis, monthlyData, guaranteeData } = useContractsData();
  const fileInputRef = useRef(null);
  const hasData = contracts.length > 0;

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Stylus
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">
                Dashboard
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {hasData && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {contracts.length} contratos
                </span>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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

            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Filtros (sticky, apenas com dados) ────────────────────── */}
      {hasData && <Filters />}

      {/* ── Conteúdo ──────────────────────────────────────────────── */}
      <main className="px-4 lg:px-6 py-6 max-w-screen-2xl mx-auto">
        {!hasData ? (
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
                    { label: 'Cauções devolvidas', value: kpis.caucoesDev, type: 'currency' },
                    { label: 'Churn financeiro', value: kpis.churn, type: 'percent' },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <span className="text-sm text-slate-600 dark:text-slate-400">{row.label}</span>
                      <span className={`text-sm font-semibold ${
                        row.type === 'percent' && kpis.churn > 5
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-800 dark:text-slate-200'
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
                      className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <span className="text-sm text-slate-600 dark:text-slate-400">{row.label}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
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
        )}
      </main>
    </div>
  );
}
