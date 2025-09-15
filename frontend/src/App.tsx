import { NavLink, Route, Routes } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';
import { useProgress } from './context/ProgressContext';
import HomePage from './pages/HomePage';
import TopicsPage from './pages/TopicsPage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';

const NAV_LINKS = [
  { to: '/', label: 'Главная' },
  { to: '/topics', label: 'Темы' },
  { to: '/practice', label: 'Задачи' },
  { to: '/progress', label: 'Прогресс' },
  { to: '/profile', label: 'Профиль' },
];

export default function App() {
  const { xp, streak } = useProgress();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-800/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">VishMat Trainer</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">Твой тренажёр по дифференциальным уравнениям</p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive
                      ? 'bg-primary text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex gap-3">
              <span className="rounded bg-primary/10 px-2 py-1 font-semibold text-primary dark:bg-primary/20">
                XP: {xp}
              </span>
              <span className="rounded bg-accent/10 px-2 py-1 font-semibold text-accent">
                🔥 {streak}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}
