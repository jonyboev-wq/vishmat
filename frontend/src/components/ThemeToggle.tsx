import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="rounded-full border border-slate-400 px-3 py-1 text-sm hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-800"
    >
      {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
    </button>
  );
}
