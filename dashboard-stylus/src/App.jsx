import { useEffect, useState } from 'react';
import { ContractsProvider } from './context/ContractsContext';
import Dashboard from './pages/Dashboard';
import PrintView from './pages/PrintView';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    // Default to light mode
    return saved === 'dark';
  });
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

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ContractsProvider>
      {view === 'print' ? (
        <PrintView />
      ) : (
        <Dashboard isDark={isDark} toggleTheme={toggleTheme} />
      )}
    </ContractsProvider>
  );
}

export default App;
