import { useState, useEffect } from 'react';
import { ContractsProvider } from './context/ContractsContext';
import Dashboard from './pages/Dashboard';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ContractsProvider>
      <Dashboard isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} />
    </ContractsProvider>
  );
}

export default App;
