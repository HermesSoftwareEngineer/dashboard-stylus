import { isWithinInterval } from 'date-fns';
import { parseContractDate } from './metrics';

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

function parseValue(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.abs(val);

  const str = String(val).replace(/[R$\s]/g, '').trim();
  if (!str) return 0;

  let normalized;
  if (str.includes(',') && str.includes('.')) {
    normalized = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    normalized = str.replace(',', '.');
  } else {
    normalized = str;
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : Math.abs(num);
}

function normalizeDestination(value) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('resid')) return 'Residencial';
  if (raw.includes('comerc')) return 'Comercial';
  if (raw.includes('misto')) return 'Misto';
  return null;
}

function parseScore(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const normalized = String(value).replace(',', '.').trim();
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

export function computePropertyKPIs(items, startDate, endDate) {
  const filtered = (!startDate && !endDate)
    ? items
    : items.filter((item) => {
      const date =
        parseContractDate(item.DataCadastro)
        ?? parseContractDate(item.DataInclusao)
        ?? parseContractDate(item.DataAtualizacao);
      return isInRange(date, startDate, endDate);
    });

  const total = filtered.length;
  const vgvTotal = filtered.reduce((sum, item) => sum + parseValue(item.Valor), 0);

  const destination = {
    Residencial: 0,
    Comercial: 0,
    Misto: 0,
  };

  filtered.forEach((item) => {
    const dest = normalizeDestination(item.Destinacao);
    if (dest && destination[dest] !== undefined) destination[dest] += 1;
  });

  const scoreBands = {
    incompleto: 0,
    medio: 0,
    bom: 0,
    muitoBom: 0,
  };

  filtered.forEach((item) => {
    const score = parseScore(item.Pontuacao);
    if (score < 50) scoreBands.incompleto += 1;
    else if (score < 70) scoreBands.medio += 1;
    else if (score < 90) scoreBands.bom += 1;
    else scoreBands.muitoBom += 1;
  });

  return {
    total,
    vgvTotal,
    destination,
    scoreBands,
  };
}
