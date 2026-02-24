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
    if (!trimmed) return null;

    // dd/mm/yyyy ou dd/mm/yyyy HH:mm[:ss]
    const dmy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+\d{2}:\d{2}(?::\d{2})?)?$/);
    if (dmy) {
      const d = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }

    // dd/mm/yy ou mm/dd/yy (com ou sem zero à esquerda)
    const dmyShort = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})(?:\s+\d{2}:\d{2}(?::\d{2})?)?$/);
    if (dmyShort) {
      const p1 = Number(dmyShort[1]);
      const p2 = Number(dmyShort[2]);
      const yy = Number(dmyShort[3]);
      const year = yy >= 70 ? 1900 + yy : 2000 + yy;

      let day = p1;
      let month = p2;

      if (p2 > 12 && p1 <= 12) {
        // assume formato mm/dd/yy
        day = p2;
        month = p1;
      }

      const d = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`);
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
 * Critérios:
 * - Não possui DataRescisao preenchida
 * - Situacao = "Ativo" (não pode ser "Cancelado", "Rescindido" ou "Moderação")
 * DataFim é ignorada intencionalmente.
 */
function isActiveContract(contract) {
  // Verifica se há data de rescisão
  if (parseContractDate(contract.DataRescisao)) return false;
  
  // Verifica a situação do contrato
  const situacao = String(contract.Situacao || contract.Situação || '').toLowerCase().trim();
  
  // Se não tem situação definida, verifica apenas pela ausência de DataRescisao
  if (!situacao) return true;
  
  // Normaliza removendo acentos
  const situacaoNormalized = situacao
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Considera ativo apenas se a situação for explicitamente "Ativo"
  return situacaoNormalized === 'ativo';
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

/**
 * Retorna a data de início mais confiável do contrato.
 * Prioridade: DataInicio -> DataAtivacao -> DataInclusao.
 */
function getContractStartDate(contract) {
  return (
    parseContractDate(contract.DataInicio)
    ?? parseContractDate(contract.DataAtivacao)
    ?? parseContractDate(contract.DataInclusao)
  );
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
      churn: 0, caucoesDev: 0, caucoesRecebidas: 0, saldoCaucoes: 0,
      caucao: 0, caucaoPercent: 0, caucaoValue: 0,
      seguroFianca: 0, seguroFiancaPercent: 0,
    };
  }

  // Carteira ativa — snapshot global (sem filtro de período)
  const activeContracts = contracts.filter(isActiveContract);
  const vgvTotal = activeContracts.reduce((sum, c) => sum + parseValue(c.ValorAluguel), 0);

  // Novos contratos no período (apenas ativos)
  const newContracts = contracts.filter((c) => {
    const d = getContractStartDate(c);
    return isInRange(d, startDate, endDate) && isActiveContract(c);
  });
  const vgl = newContracts.reduce((sum, c) => sum + parseValue(c.ValorAluguel), 0);
  const ticketMedio = newContracts.length > 0 ? vgl / newContracts.length : 0;

  // Rescisões no período
  const rescissions = contracts.filter((c) => {
    const d = parseContractDate(c.DataRescisao);
    return isInRange(d, startDate, endDate);
  });
  const valorRescisoes = rescissions.reduce((sum, c) => sum + parseValue(c.ValorAluguel), 0);
  const ticketMedioRescisoes = rescissions.length > 0 ? valorRescisoes / rescissions.length : 0;
  
  // Cauções devolvidas (apenas contratos com Situacao = 'Rescindido')
  const rescindidos = rescissions.filter((c) => {
    const situacao = String(c.Situacao || c.Situação || '').toLowerCase().trim();
    const situacaoNormalized = situacao.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return situacaoNormalized === 'rescindido';
  });
  const caucoesDev = rescindidos.reduce((sum, c) => sum + parseValue(c.ValorGarantia), 0);
  
  // Cauções recebidas (valor da garantia dos novos contratos ativos)
  const caucoesRecebidas = newContracts.reduce((sum, c) => sum + parseValue(c.ValorGarantia), 0);

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
    caucoesRecebidas,
    saldoCaucoes: caucoesRecebidas - caucoesDev,
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
 * Determina a granularidade ideal baseada no período.
 * - Até 45 dias: diária
 * - 46 a 180 dias: semanal
 * - Mais de 180 dias: mensal
 */
function getGranularity(startDate, endDate) {
  const diffMs = endDate - startDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays <= 45) return 'daily';
  if (diffDays <= 180) return 'weekly';
  return 'monthly';
}

/**
 * Agrupa contratos por período (dia, semana ou mês) dentro do intervalo para os gráficos de evolução.
 * A granularidade é determinada automaticamente baseada no tamanho do período ou pode ser forçada.
 *
 * @param {Object[]} contracts
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @param {string} forcedGranularity - 'auto', 'daily', 'weekly' ou 'monthly'
 * @returns {Object[]} Array com dados { month, novos, rescisoes, vgl, churnValor }
 */
export function computeMonthlyData(contracts, startDate, endDate, forcedGranularity = 'auto') {
  const now = new Date();
  const effectiveStart = startDate ?? new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
  const effectiveEnd = endDate ?? now;

  const granularity = forcedGranularity === 'auto' 
    ? getGranularity(effectiveStart, effectiveEnd)
    : forcedGranularity;
  const periods = {};

  // Monta estrutura de períodos no intervalo
  if (granularity === 'daily') {
    let cursor = new Date(effectiveStart);
    cursor.setHours(0, 0, 0, 0);
    
    while (cursor <= effectiveEnd) {
      const key = format(cursor, 'yyyy-MM-dd');
      periods[key] = {
        month: format(cursor, 'dd/MM', { locale: ptBR }),
        novos: 0,
        rescisoes: 0,
        vgl: 0,
        churnValor: 0,
      };
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  } else if (granularity === 'weekly') {
    let cursor = new Date(effectiveStart);
    cursor.setHours(0, 0, 0, 0);
    // Ajusta para o início da semana (domingo)
    const day = cursor.getDay();
    cursor = new Date(cursor.getTime() - day * 24 * 60 * 60 * 1000);
    
    while (cursor <= effectiveEnd) {
      const key = format(cursor, 'yyyy-\'W\'ww');
      const endOfWeek = new Date(cursor.getTime() + 6 * 24 * 60 * 60 * 1000);
      periods[key] = {
        month: format(cursor, 'dd/MM', { locale: ptBR }) + ' - ' + format(endOfWeek, 'dd/MM', { locale: ptBR }),
        novos: 0,
        rescisoes: 0,
        vgl: 0,
        churnValor: 0,
      };
      cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  } else {
    // monthly
    let cursor = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), 1);
    
    while (cursor <= effectiveEnd) {
      const key = format(cursor, 'yyyy-MM');
      periods[key] = {
        month: format(cursor, 'MMM/yy', { locale: ptBR }),
        novos: 0,
        rescisoes: 0,
        vgl: 0,
        churnValor: 0,
      };
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  // Garante ao menos um período
  if (Object.keys(periods).length === 0) {
    const key = format(now, 'yyyy-MM');
    periods[key] = { month: format(now, 'MMM/yy', { locale: ptBR }), novos: 0, rescisoes: 0, vgl: 0, churnValor: 0 };
  }

  // Função auxiliar para gerar chave baseada na granularidade
  const getKey = (date) => {
    if (granularity === 'daily') {
      return format(date, 'yyyy-MM-dd');
    } else if (granularity === 'weekly') {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const weekStart = new Date(d.getTime() - day * 24 * 60 * 60 * 1000);
      return format(weekStart, 'yyyy-\'W\'ww');
    } else {
      return format(date, 'yyyy-MM');
    }
  };

  contracts.forEach((c) => {
    // Novos contratos (apenas ativos)
    const dataInicio = getContractStartDate(c);
    if (dataInicio && isInRange(dataInicio, startDate, endDate) && isActiveContract(c)) {
      const key = getKey(dataInicio);
      if (periods[key]) {
        periods[key].novos += 1;
        periods[key].vgl += parseValue(c.ValorAluguel);
      }
    }

    // Rescisões
    const dataRescisao = parseContractDate(c.DataRescisao);
    if (dataRescisao && isInRange(dataRescisao, startDate, endDate)) {
      const key = getKey(dataRescisao);
      if (periods[key]) {
        periods[key].rescisoes += 1;
        periods[key].churnValor += parseValue(c.ValorAluguel);
      }
    }
  });

  return Object.values(periods);
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
    const d = getContractStartDate(c);
    if (!isInRange(d, startDate, endDate)) return;
    if (!isActiveContract(c)) return;

    const tipo = getGuaranteeType(c);
    counts[tipo] = (counts[tipo] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
