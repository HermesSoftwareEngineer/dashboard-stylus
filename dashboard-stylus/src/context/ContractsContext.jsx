import { createContext, useContext, useState } from 'react';

const ContractsContext = createContext(null);

const defaultFilter = {
  period: 'this_month',
  startDate: '',
  endDate: '',
};

const defaultPropertyFilter = {
  period: 'all',
  startDate: '',
  endDate: '',
};

const defaultAtendimentosFilter = {
  period: 'this_month',
  startDate: '',
  endDate: '',
  collaborator: 'todos',
  purpose: 'todos',
};

export function ContractsProvider({ children }) {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [propertiesRent, setPropertiesRent] = useState([]);
  const [propertiesSale, setPropertiesSale] = useState([]);
  const [propertyFilter, setPropertyFilter] = useState(defaultPropertyFilter);
  const [atendimentosRent, setAtendimentosRent] = useState([]);
  const [atendimentosSale, setAtendimentosSale] = useState([]);
  const [atendimentosFilter, setAtendimentosFilter] = useState(defaultAtendimentosFilter);

  const updateFilter = (updates) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  const updatePropertyFilter = (updates) => {
    setPropertyFilter((prev) => ({ ...prev, ...updates }));
  };

  const updateAtendimentosFilter = (updates) => {
    setAtendimentosFilter((prev) => ({ ...prev, ...updates }));
  };

  const saveDataToStorage = () => {
    const data = {
      contracts,
      propertiesRent,
      propertiesSale,
      atendimentosRent,
      atendimentosSale,
      filter,
      propertyFilter,
      atendimentosFilter
    };

    // 1. Tenta salvar no window para acesso direto via opener (mais confiável para grandes dados)
    window.dashboardPrintData = data;

    // 2. Tenta salvar no localStorage como backup
    try {
      localStorage.setItem('dashboard:print-data', JSON.stringify(data));
      console.log('Dados salvos para impressão.');
    } catch (err) {
      console.error('Erro ao salvar dados no localStorage (provavelmente cota excedida):', err);
    }
  };

  const loadDataFromStorage = () => {
    let data = null;

    // 1. Tenta recuperar via window.opener (se disponível)
    if (window.opener && window.opener.dashboardPrintData) {
      data = window.opener.dashboardPrintData;
      console.log('Dados carregados via window.opener');
    }

    // 2. Se falhar, tenta localStorage
    if (!data) {
      try {
        const raw = localStorage.getItem('dashboard:print-data');
        if (raw) {
          data = JSON.parse(raw);
          console.log('Dados carregados via localStorage');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    }

    if (data) {
      if (data.contracts) setContracts(data.contracts);
      if (data.propertiesRent) setPropertiesRent(data.propertiesRent);
      if (data.propertiesSale) setPropertiesSale(data.propertiesSale);
      if (data.atendimentosRent) setAtendimentosRent(data.atendimentosRent);
      if (data.atendimentosSale) setAtendimentosSale(data.atendimentosSale);
      if (data.filter) setFilter(data.filter);
      if (data.propertyFilter) setPropertyFilter(data.propertyFilter);
      if (data.atendimentosFilter) setAtendimentosFilter(data.atendimentosFilter);
      return true;
    }
    return false;
  };

  return (
    <ContractsContext.Provider value={{
      contracts,
      setContracts,
      filter,
      updateFilter,
      propertiesRent,
      setPropertiesRent,
      propertiesSale,
      setPropertiesSale,
      propertyFilter,
      updatePropertyFilter,
      atendimentosRent,
      setAtendimentosRent,
      atendimentosSale,
      setAtendimentosSale,
      atendimentosFilter,
      updateAtendimentosFilter,
      saveDataToStorage,
      loadDataFromStorage
    }}>
      {children}
    </ContractsContext.Provider>
  );
}

export function useContracts() {
  const ctx = useContext(ContractsContext);
  if (!ctx) throw new Error('useContracts deve ser usado dentro de ContractsProvider');
  return ctx;
}
