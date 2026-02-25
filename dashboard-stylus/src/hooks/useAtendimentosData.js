import { useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';
import { getDateRange } from '../utils/dateRange';
import { computeAtendimentosMetrics, computeAtendimentosTimeline } from '../utils/atendimentosMetrics';

export function useAtendimentosData() {
  const { atendimentosRent, atendimentosSale, atendimentosFilter } = useContracts();

  const { startDate, endDate } = useMemo(
    () => getDateRange(atendimentosFilter),
    [atendimentosFilter]
  );

  const data = useMemo(() => {
    if (atendimentosFilter.purpose === 'aluguel') return atendimentosRent;
    if (atendimentosFilter.purpose === 'venda') return atendimentosSale;
    return [...atendimentosRent, ...atendimentosSale];
  }, [atendimentosRent, atendimentosSale, atendimentosFilter.purpose]);

  const metrics = useMemo(
    () => computeAtendimentosMetrics(data, startDate, endDate, atendimentosFilter),
    [data, startDate, endDate, atendimentosFilter]
  );

  const timeline = useMemo(
    () => computeAtendimentosTimeline(atendimentosRent, atendimentosSale, startDate, endDate, atendimentosFilter),
    [atendimentosRent, atendimentosSale, startDate, endDate, atendimentosFilter]
  );

  return {
    data,
    startDate,
    endDate,
    metrics,
    timeline,
  };
}
