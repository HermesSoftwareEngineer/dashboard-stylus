export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      {isDark ? (
        /* Sol — modo escuro ativo, clique para ir pro claro */
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        /* Lua — modo claro ativo, clique para ir pro escuro */
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
