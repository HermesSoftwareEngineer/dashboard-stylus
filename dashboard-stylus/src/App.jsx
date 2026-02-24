import { useEffect, useState } from 'react';
import { ContractsProvider } from './context/ContractsContext';
import Dashboard from './pages/Dashboard';
import PrintView from './pages/PrintView';

function App() {
  const isDark = true;
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Verifica se estamos no modo de impressão
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'print') {
      setView('print');
    }
  }, [isDark]);

  return (
    <ContractsProvider>
      {view === 'print' ? <PrintView /> : <Dashboard />}
    </ContractsProvider>
  );
}

export default App;
