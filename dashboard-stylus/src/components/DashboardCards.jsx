import { formatCurrency, formatPercent, formatNumber } from '../utils/metrics';

// ─── Card base ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, title, value, sub, subLabel, accent = 'blue', badge }) {
  const accents = {
    blue: 'bg-neutral-800 text-sky-300',
    green: 'bg-neutral-800 text-emerald-300',
    indigo: 'bg-neutral-800 text-indigo-300',
    teal: 'bg-neutral-800 text-teal-300',
    orange: 'bg-neutral-800 text-orange-300',
    red: 'bg-neutral-800 text-red-300',
    purple: 'bg-neutral-800 text-purple-300',
    slate: 'bg-neutral-800 text-neutral-300',
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 flex flex-col gap-3 shadow-[0_0_0_1px_rgba(24,24,27,0.6)] hover:shadow-[0_0_0_1px_rgba(63,63,70,0.8)] transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accents[accent]}`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accents[accent]}`}>
            {badge}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-red-300 uppercase tracking-wide mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-neutral-100 leading-tight">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-neutral-400 mt-1">
            {subLabel && <span className="font-medium">{subLabel}: </span>}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Card de garantia ──────────────────────────────────────────────────────────

function GuaranteeCard({ title, count, percent, value, accent, icon }) {
  const bars = {
    blue: 'bg-sky-400',
    purple: 'bg-purple-400',
    slate: 'bg-neutral-600',
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 shadow-[0_0_0_1px_rgba(24,24,27,0.6)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-medium text-red-300 uppercase tracking-wide">
          {title}
        </p>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-neutral-100">{count}</span>
        <span className="text-sm font-semibold text-neutral-400">
          {formatPercent(percent)}
        </span>
      </div>
      {/* Barra de progresso */}
      <div className="w-full bg-neutral-800 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${bars[accent] || bars.blue}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {value > 0 && (
        <p className="text-xs text-neutral-400">
          Valor: <span className="font-medium">{formatCurrency(value)}</span>
        </p>
      )}
    </div>
  );
}

// ─── DashboardCards principal ──────────────────────────────────────────────────

export default function DashboardCards({ kpis }) {
  return (
    <div className="space-y-4">
      {/* Linha 1 — KPIs principais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          accent="blue"
          title="VGV da Carteira"
          value={formatCurrency(kpis.vgvTotal)}
          sub={`${formatNumber(kpis.totalAtivos)} ativos`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          }
        />

        <KpiCard
          accent="green"
          title="Contratos Ativos"
          value={formatNumber(kpis.totalAtivos)}
          sub={formatCurrency(kpis.vgvTotal)}
          subLabel="VGV"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KpiCard
          accent="indigo"
          title="Novos Contratos"
          value={formatNumber(kpis.novosContratos)}
          sub={formatCurrency(kpis.ticketMedio)}
          subLabel="Ticket médio"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        />

        <KpiCard
          accent="teal"
          title="VGL (Vol. Financeiro)"
          value={formatCurrency(kpis.vgl)}
          sub={`${formatNumber(kpis.novosContratos)} contratos`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <KpiCard
          accent="orange"
          title="Rescisões"
          value={formatNumber(kpis.rescisoes)}
          sub={formatCurrency(kpis.valorRescisoes)}
          subLabel="Valor total"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          }
        />

        <KpiCard
          accent="red"
          title="Churn Financeiro"
          value={formatPercent(kpis.churn)}
          badge={kpis.churn > 5 ? 'Alto' : kpis.churn > 2 ? 'Médio' : 'Baixo'}
          sub={formatCurrency(kpis.valorRescisoes)}
          subLabel="Valor saído"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
            </svg>
          }
        />
      </div>

      {/* Linha 2 — Garantias e métricas secundárias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <GuaranteeCard
          title="Caução"
          count={kpis.caucao}
          percent={kpis.caucaoPercent}
          value={kpis.caucaoValue}
          accent="blue"
          icon="🔒"
        />
        <GuaranteeCard
          title="Seguro Fiança"
          count={kpis.seguroFianca}
          percent={kpis.seguroFiancaPercent}
          value={0}
          accent="purple"
          icon="🛡️"
        />

        <KpiCard
          accent="slate"
          title="Cauções Devolvidas"
          value={formatCurrency(kpis.caucoesDev)}
          sub={`${formatNumber(kpis.rescisoes)} rescisões`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          }
        />

        <KpiCard
          accent="orange"
          title="Ticket Médio (Novas)"
          value={formatCurrency(kpis.ticketMedio)}
          sub={`${formatNumber(kpis.novosContratos)} novos`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
          }
        />

        <KpiCard
          accent="red"
          title="Ticket Médio (Rescisões)"
          value={formatCurrency(kpis.ticketMedioRescisoes)}
          sub={`${formatNumber(kpis.rescisoes)} rescisões`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
