import { createContext, useContext, useState } from 'react';

const ContractsContext = createContext(null);

const defaultFilter = {
  period: 'this_month',
  startDate: '',
  endDate: '',
};

export function ContractsProvider({ children }) {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);

  const updateFilter = (updates) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ContractsContext.Provider value={{ contracts, setContracts, filter, updateFilter }}>
      {children}
    </ContractsContext.Provider>
  );
}

export function useContracts() {
  const ctx = useContext(ContractsContext);
  if (!ctx) throw new Error('useContracts deve ser usado dentro de ContractsProvider');
  return ctx;
}
