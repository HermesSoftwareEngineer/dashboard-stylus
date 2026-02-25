import { createContext, useContext, useState } from 'react';

const ContractsContext = createContext(null);

const defaultFilter = {
  period: 'this_month',
  startDate: '',
  endDate: '',
  granularity: 'auto',
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
  granularity: 'auto',
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
    let source = '';

    // 1. Tenta recuperar via window.opener (se disponível)
    try {
      if (window.opener && window.opener.dashboardPrintData) {
        data = window.opener.dashboardPrintData;
        source = 'window.opener';
        console.log('✓ Dados carregados via window.opener');
      }
    } catch (err) {
      console.warn('window.opener indisponível:', err.message);
    }

    // 2. Se falhar, tenta localStorage - FORÇA LEITURA
    if (!data) {
      try {
        const raw = localStorage.getItem('dashboard:print-data');
        if (raw) {
          data = JSON.parse(raw);
          source = 'localStorage';
          console.log('✓ Dados carregados via localStorage. Tamanho:', Object.keys(data).length);
        } else {
          console.warn('localStorage vazio - nenhum dado salvo');
          // Log todas as chaves do localStorage para debug
          console.log('Chaves do localStorage:', Object.keys(localStorage));
        }
      } catch (err) {
        console.error('✗ Erro ao carregar dados do localStorage:', err);
      }
    }

    if (data) {
      console.log('Carregando dados de:', source);
      if (data.contracts) {
        setContracts(data.contracts);
        console.log(`  - Contratos: ${data.contracts.length}`);
      }
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
