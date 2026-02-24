import { format, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── Formatadores ──────────────────────────────────────────────────────────────

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export function formatPercent(value, decimals = 1) {
  return `${(value || 0).toFixed(decimals)}%`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
}

// ─── Helpers internos ──────────────────────────────────────────────────────────

/**
 * Converte qualquer representação de data para Date.
 * Suporta: Date, string ISO, string dd/mm/yyyy, número serial do Excel.
 */
export function parseContractDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === 'string') {
    const trimmed = value.trim();

    // dd/mm/yyyy
    const dmy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmy) {
      const d = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }

    // yyyy-mm-dd ou ISO
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'number') {
    // Serial date do Excel (dias desde 30/12/1899)
    const d = new Date(Math.round((value - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Verifica se uma data está dentro do intervalo [startDate, endDate].
 * Se startDate e endDate forem null, considera dentro do intervalo.
 */
function isInRange(date, startDate, endDate) {
  if (!date) return false;
  if (!startDate && !endDate) return true;

  try {
    return isWithinInterval(date, {
      start: startDate || new Date(0),
      end: endDate || new Date(8_640_000_000_000_000),
    });
  } catch {
    return false;
  }
}

/**
 * Verifica se um contrato está ativo.
 * Critério: não possui DataRescisao preenchida.
 * DataFim é ignorada intencionalmente.
 */
function isActiveContract(contract) {
  return !parseContractDate(contract.DataRescisao);
}

/**
 * Converte qualquer representação de valor monetário para número.
 *
 * Formatos suportados:
 *   number  → usado diretamente (raw: true no xlsx)
 *   "1828.96"   → ponto como decimal (xlsx raw)
 *   "1.828,96"  → formato brasileiro
 *   "1828,96"   → vírgula decimal sem separador de milhar
 *   "R$ 1.828,96" → com símbolo
 */
function parseValue(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.abs(val);

  const str = String(val).replace(/[R$\s]/g, '').trim();
  if (!str) return 0;

  let normalized;
  if (str.includes(',') && str.includes('.')) {
    // "1.828,96" → ponto=milhar, vírgula=decimal
    normalized = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    // "1828,96" → vírgula=decimal
    normalized = str.replace(',', '.');
  } else {
    // "1828.96" ou "1828" → ponto=decimal ou inteiro
    normalized = str;
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : Math.abs(num);
}

/**
 * Retorna o tipo de garantia normalizado de um contrato.
 */
function getGuaranteeType(contract) {
  const raw = String(contract.FormaGarantia || contract.TipoGarantia || '').toLowerCase().trim();
  if (!raw) return 'Não informado';

  if (raw.includes('caução') || raw.includes('caucao') || raw.includes('cauc')) return 'Caução';
  if (raw.includes('seguro') || raw.includes('fiança') || raw.includes('fianca')) return 'Seguro Fiança';
  if (raw.includes('título') || raw.includes('titulo')) return 'Título de Capitalização';
  if (raw.includes('fiador')) return 'Fiador';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ─── KPIs ──────────────────────────────────────────────────────────────────────

/**
 * Calcula todos os KPIs gerenciais para o período informado.
 *
 * @param {Object[]} contracts - Array de contratos
 * @param {Date|null} startDate - Início do período filtrado
 * @param {Date|null} endDate - Fim do período filtrado
 * @returns {Object} Objeto com todos os KPIs calculados
 */
export function computeKPIs(contracts, startDate, endDate) {
  if (!contracts.length) {
    return {
      vgvTotal: 0, totalAtivos: 0,
      novosContratos: 0, vgl: 0, ticketMedio: 0,
      rescisoes: 0, valorRescisoes: 0, ticketMedioRescisoes: 0,
      churn: 0, caucoesDev: 0,
      caucao: 0, caucaoPercent: 0, caucaoValue: 0,
      seguroFianca: 0, seguroFiancaPercent: 0,
    };
  }

  // Carteira ativa — snapshot global (sem filtro de período)
  const activeContracts = contracts.filter(isActiveContract);
  const vgvTotal = activeContracts.reduce((sum, c) => sum + parseValue(c.ValorAluguel), 0);

  // Novos contratos no período
  const newContracts = contracts.filter((c) => {
    const d = parseContractDate(c.DataInicio) ?? parseContractDate(c.DataInclusao);
    return isInRange(d, startDate, endDate);
  });
  const vgl = newContracts.reduce((sum, c) => sum + parseValue(c.ValorAluguel), 0);
  const newWithValue = newContracts.filter((c) => parseValue(c.ValorAluguel) > 0);
  const ticketMedio = newWithValue.length > 0 ? vgl / newWithValue.length : 0;

  // Rescisões no período
  const rescissions = contracts.filter((c) => {
    const d = parseContractDate(c.DataRescisao);
    return isInRange(d, startDate, endDate);
  });
  const valorRescisoes = rescissions.reduce((sum, c) => sum + parseValue(c.ValorAluguel), 0);
  const rescWithValue = rescissions.filter((c) => parseValue(c.ValorAluguel) > 0);
  const ticketMedioRescisoes = rescWithValue.length > 0 ? valorRescisoes / rescWithValue.length : 0;
  const caucoesDev = rescissions.reduce((sum, c) => sum + parseValue(c.ValorGarantia), 0);

  // Churn financeiro = valor rescindido / VGV total * 100
  const churn = vgvTotal > 0 ? (valorRescisoes / vgvTotal) * 100 : 0;

  // Garantias dos novos contratos
  const caucaoContracts = newContracts.filter((c) => getGuaranteeType(c) === 'Caução');
  const seguroFiancaContracts = newContracts.filter((c) => getGuaranteeType(c) === 'Seguro Fiança');
  const caucaoValue = caucaoContracts.reduce((sum, c) => sum + parseValue(c.ValorGarantia), 0);

  return {
    vgvTotal,
    totalAtivos: activeContracts.length,
    novosContratos: newContracts.length,
    vgl,
    ticketMedio,
    rescisoes: rescissions.length,
    valorRescisoes,
    ticketMedioRescisoes,
    churn,
    caucoesDev,
    caucao: caucaoContracts.length,
    caucaoPercent: newContracts.length > 0 ? (caucaoContracts.length / newContracts.length) * 100 : 0,
    caucaoValue,
    seguroFianca: seguroFiancaContracts.length,
    seguroFiancaPercent:
      newContracts.length > 0 ? (seguroFiancaContracts.length / newContracts.length) * 100 : 0,
  };
}

// ─── Dados mensais para gráficos ───────────────────────────────────────────────

/**
 * Agrupa contratos por mês dentro do período para os gráficos de evolução.
 * Se o período for "tudo" (sem datas), exibe os últimos 12 meses.
 *
 * @param {Object[]} contracts
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @returns {Object[]} Array com dados mensais { month, novos, rescisoes, vgl, churnValor }
 */
export function computeMonthlyData(contracts, startDate, endDate) {
  const now = new Date();
  const effectiveStart = startDate ?? new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
  const effectiveEnd = endDate ?? now;

  // Monta estrutura de meses no intervalo
  const months = {};
  let cursor = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), 1);

  while (cursor <= effectiveEnd) {
    const key = format(cursor, 'yyyy-MM');
    months[key] = {
      month: format(cursor, 'MMM/yy', { locale: ptBR }),
      novos: 0,
      rescisoes: 0,
      vgl: 0,
      churnValor: 0,
    };
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  // Garante ao menos um mês
  if (Object.keys(months).length === 0) {
    const key = format(now, 'yyyy-MM');
    months[key] = { month: format(now, 'MMM/yy', { locale: ptBR }), novos: 0, rescisoes: 0, vgl: 0, churnValor: 0 };
  }

  contracts.forEach((c) => {
    // Novos contratos
    const dataInicio = parseContractDate(c.DataInicio) ?? parseContractDate(c.DataInclusao);
    if (dataInicio && isInRange(dataInicio, startDate, endDate)) {
      const key = format(dataInicio, 'yyyy-MM');
      if (months[key]) {
        months[key].novos += 1;
        months[key].vgl += parseValue(c.ValorAluguel);
      }
    }

    // Rescisões
    const dataRescisao = parseContractDate(c.DataRescisao);
    if (dataRescisao && isInRange(dataRescisao, startDate, endDate)) {
      const key = format(dataRescisao, 'yyyy-MM');
      if (months[key]) {
        months[key].rescisoes += 1;
        months[key].churnValor += parseValue(c.ValorAluguel);
      }
    }
  });

  return Object.values(months);
}

// ─── Dados de garantias para gráfico pizza ─────────────────────────────────────

/**
 * Agrupa contratos novos do período por tipo de garantia para o gráfico pizza.
 *
 * @param {Object[]} contracts
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @returns {{ name: string, value: number }[]}
 */
export function computeGuaranteeData(contracts, startDate, endDate) {
  const counts = {};

  contracts.forEach((c) => {
    const d = parseContractDate(c.DataInicio) ?? parseContractDate(c.DataInclusao);
    if (!isInRange(d, startDate, endDate)) return;

    const tipo = getGuaranteeType(c);
    counts[tipo] = (counts[tipo] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
