import { isWithinInterval } from 'date-fns';
import { parseContractDate } from './metrics';

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

function normalizeText(value) {
  return decodeHtml(value).toLowerCase().trim();
}

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

function parseDate(value) {
  return parseContractDate(value);
}

function extractIds(value) {
  if (!value) return [];
  const decoded = decodeHtml(value);
  const matches = decoded.match(/\d+/g);
  return matches ? matches.map((m) => m.trim()).filter(Boolean) : [];
}

function getPurpose(value) {
  const raw = normalizeText(value);
  if (raw.includes('venda')) return 'venda';
  if (raw.includes('alug')) return 'aluguel';
  return 'outros';
}

function isQualified(item) {
  const fase = normalizeText(item.Fase);
  const termometro = normalizeText(item.Termometro);
  const mql = normalizeText(item.Mql);

  if (mql && mql !== '0' && mql !== 'nao' && mql !== 'não') return true;
  if (termometro && termometro !== 'indefinido') return true;
  if (fase.includes('sele') || fase.includes('qualific') || fase.includes('lead')) return true;
  if (fase.includes('visita') || fase.includes('proposta') || fase.includes('negócio') || fase.includes('negocio')) return true;
  return false;
}

function isClosed(item) {
  const situacao = normalizeText(item.Situacao);
  const fase = normalizeText(item.Fase);
  const ultima = normalizeText(item.UltimaInteracao);

  return (
    situacao.includes('negócio realizado') ||
    situacao.includes('negocio realizado') ||
    fase.includes('negócio realizado') ||
    fase.includes('negocio realizado') ||
    ultima.includes('negócio realizado') ||
    ultima.includes('negocio realizado')
  );
}

function getChannel(value) {
  const raw = normalizeText(value);
  if (!raw) return 'Outros';
  if (raw.includes('site')) return 'Site';
  if (raw.includes('viva real')) return 'Viva Real';
  if (raw.includes('olx')) return 'OLX';
  if (raw.includes('imovel web') || raw.includes('imóvel web')) return 'Imóvel Web';
  if (raw.includes('facebook')) return 'Facebook';
  if (raw.includes('grupozap') || raw.includes('grupo zap')) return 'GrupoZap';
  if (raw.includes('chave facil') || raw.includes('chave fácil')) return 'Chave Fácil';
  if (raw.includes('indicacao') || raw.includes('indicação')) return 'Indicação';
  if (raw.includes('placa') || raw.includes('faixa')) return 'Placas/Faixas';
  return 'Outros';
}

function normalizeDiscardReason(value) {
  const raw = normalizeText(value);
  if (!raw) return 'Outros';
  if (raw.includes('valor')) return 'Valor muito alto';
  if (raw.includes('duplicado')) return 'Atendimento duplicado';
  if (raw.includes('comprou') || raw.includes('alugou')) {
    if (raw.includes('terceiros')) return 'Alugou/comprou com terceiros';
  }
  if (raw.includes('contato inv')) return 'Contato inválido';
  if (raw.includes('desist')) return 'Desistência';
  if (raw.includes('indecis')) return 'Indecisão';
  if (raw.includes('não responde') || raw.includes('nao responde')) return 'Não responde contato';
  if (raw.includes('indispon')) return 'Imóvel indisponível';
  return 'Outros';
}

function formatCollaborator(value) {
  const decoded = decodeHtml(value).trim();
  return decoded || 'Sem responsável';
}

function buildTopImoveis(items) {
  const clickCounts = new Map();
  const visitCounts = new Map();
  const leadCounts = new Map();

  items.forEach((item) => {
    const carrinhoIds = extractIds(item.ImoveisCarrinho);
    const visitaIds = extractIds(item.ImoveisVisita);
    const propostaIds = extractIds(item.ImoveisProposta);

    carrinhoIds.forEach((id) => {
      clickCounts.set(id, (clickCounts.get(id) || 0) + 1);
    });

    visitaIds.forEach((id) => {
      visitCounts.set(id, (visitCounts.get(id) || 0) + 1);
    });

    const leadSet = new Set([...carrinhoIds, ...visitaIds, ...propostaIds]);
    leadSet.forEach((id) => {
      leadCounts.set(id, (leadCounts.get(id) || 0) + 1);
    });
  });

  const rows = Array.from(leadCounts.entries()).map(([id, leads]) => ({
    id,
    leads,
    clicks: clickCounts.get(id) || 0,
    visits: visitCounts.get(id) || 0,
  }));

  rows.sort((a, b) => b.leads - a.leads);
  return rows.slice(0, 10);
}

export function computeAtendimentosMetrics(items, startDate, endDate, filter) {
  const collaboratorFilter = filter?.collaborator || 'todos';
  const purposeFilter = filter?.purpose || 'todos';

  const filtered = items.filter((item) => {
    const date = parseDate(item.DataHoraInclusao) || parseDate(item.DataHoraUltimaInteracao);
    if (!isInRange(date, startDate, endDate)) return false;

    if (purposeFilter !== 'todos') {
      const purpose = getPurpose(item.Finalidade);
      if (purpose !== purposeFilter) return false;
    }

    if (collaboratorFilter !== 'todos') {
      const collaborator = formatCollaborator(item.Corretor);
      if (collaborator !== collaboratorFilter) return false;
    }

    return true;
  });

  const leads = filtered.length;
  const qualified = filtered.filter(isQualified).length;

  const visits = filtered.filter((item) => extractIds(item.ImoveisVisita).length > 0).length;
  const proposals = filtered.filter((item) => extractIds(item.ImoveisProposta).length > 0).length;
  const closed = filtered.filter(isClosed).length;

  const conversionRate = leads > 0 ? (closed / leads) * 100 : 0;

  const funnelStages = [
    { name: 'Leads', value: leads },
    { name: 'Qualificados', value: qualified },
    { name: 'Visitas realizadas', value: visits },
    { name: 'Propostas recebidas', value: proposals },
    { name: 'Negócios fechados', value: closed },
  ];

  const channels = new Map();
  filtered.forEach((item) => {
    const channel = getChannel(item.Midia || item.Indicacao || '');
    const entry = channels.get(channel) || { channel, leads: 0, closed: 0 };
    entry.leads += 1;
    if (isClosed(item)) entry.closed += 1;
    channels.set(channel, entry);
  });

  const originData = Array.from(channels.values()).map((entry) => ({
    ...entry,
    conversion: entry.leads > 0 ? (entry.closed / entry.leads) * 100 : 0,
  }));

  originData.sort((a, b) => b.leads - a.leads);

  const discardCounts = new Map();
  filtered
    .filter((item) => normalizeText(item.Situacao).includes('descart'))
    .forEach((item) => {
      const reason = normalizeDiscardReason(item.SituacaoDescarte || item.UltimaInteracao);
      discardCounts.set(reason, (discardCounts.get(reason) || 0) + 1);
    });

  const discardData = Array.from(discardCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  const discardTotal = discardData.reduce((sum, item) => sum + item.count, 0);
  let cumulative = 0;
  const paretoData = discardData.map((item) => {
    cumulative += item.count;
    return {
      ...item,
      cumulative: discardTotal > 0 ? (cumulative / discardTotal) * 100 : 0,
    };
  });

  return {
    filtered,
    funnelStages,
    conversionRate,
    originData,
    topImoveis: buildTopImoveis(filtered),
    paretoData,
  };
}
