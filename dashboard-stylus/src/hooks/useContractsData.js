import { useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';
import { getDateRange } from '../utils/dateRange';
import {
  computeKPIs,
  computeMonthlyData,
  computeGuaranteeData,
} from '../utils/metrics';

export function useContractsData() {
  const { contracts, filter } = useContracts();

  const { startDate, endDate } = useMemo(() => getDateRange(filter), [filter]);

  const kpis = useMemo(
    () => computeKPIs(contracts, startDate, endDate),
    [contracts, startDate, endDate]
  );

  const monthlyData = useMemo(
    () => computeMonthlyData(contracts, startDate, endDate, filter.granularity || 'auto'),
    [contracts, startDate, endDate, filter.granularity]
  );

  const guaranteeData = useMemo(
    () => computeGuaranteeData(contracts, startDate, endDate),
    [contracts, startDate, endDate]
  );

  return { kpis, monthlyData, guaranteeData, startDate, endDate };
}
