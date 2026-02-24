import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  subDays, subWeeks, subMonths, subQuarters, subYears,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEK_OPTIONS = { locale: ptBR };

/**
 * Retorna o intervalo de datas { startDate, endDate } para o período selecionado.
 * Retorna null quando não há restrição de data.
 *
 * @param {{ period: string, startDate: string, endDate: string }} filter
 * @returns {{ startDate: Date|null, endDate: Date|null }}
 */
export function getDateRange(filter) {
  const now = new Date();

  switch (filter.period) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now) };

    case 'yesterday': {
      const d = subDays(now, 1);
      return { startDate: startOfDay(d), endDate: endOfDay(d) };
    }

    case 'this_week':
      return {
        startDate: startOfWeek(now, WEEK_OPTIONS),
        endDate: endOfWeek(now, WEEK_OPTIONS),
      };

    case 'last_week': {
      const d = subWeeks(now, 1);
      return {
        startDate: startOfWeek(d, WEEK_OPTIONS),
        endDate: endOfWeek(d, WEEK_OPTIONS),
      };
    }

    case 'this_month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };

    case 'last_month': {
      const d = subMonths(now, 1);
      return { startDate: startOfMonth(d), endDate: endOfMonth(d) };
    }

    case 'this_quarter':
      return { startDate: startOfQuarter(now), endDate: endOfQuarter(now) };

    case 'last_quarter': {
      const d = subQuarters(now, 1);
      return { startDate: startOfQuarter(d), endDate: endOfQuarter(d) };
    }

    case 'this_year':
      return { startDate: startOfYear(now), endDate: endOfYear(now) };

    case 'last_year': {
      const d = subYears(now, 1);
      return { startDate: startOfYear(d), endDate: endOfYear(d) };
    }

    case 'custom':
      return {
        startDate: filter.startDate ? startOfDay(new Date(filter.startDate)) : null,
        endDate: filter.endDate ? endOfDay(new Date(filter.endDate)) : null,
      };

    case 'all':
    default:
      return { startDate: null, endDate: null };
  }
}
