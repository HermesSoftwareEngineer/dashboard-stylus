import { useMemo } from 'react';
import { useContracts } from '../context/ContractsContext';
import { getDateRange } from '../utils/dateRange';

export function usePropertiesData() {
  const { propertyFilter } = useContracts();

  const { startDate, endDate } = useMemo(
    () => getDateRange(propertyFilter),
    [propertyFilter]
  );

  return { startDate, endDate };
}
