import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/subscriptions', label: 'Subscriptions', end: true },
  { to: '/subscriptions/new', label: 'Add' },
  { to: '/reports', label: 'Reports' },
];

const linkClass = ({ isActive }) =>
  `text-sm rounded-lg px-3 py-1.5 transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-950 dark:text-blue-300'
      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors ${
    isActive
      ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500 dark:text-white'
      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
  }`;

export default function AppNav() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:bg-gray-900/95 dark:border-gray-800 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-5">
            <span className="shrink-0 text-xl font-bold text-blue-600 dark:text-blue-400">SubTracker</span>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  {item.label === 'Add' ? '+ Add' : item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden max-w-52 truncate text-sm text-gray-500 dark:text-gray-400 lg:block">
              {user?.email}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 sm:px-3 sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 md:hidden"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-md items-center gap-2">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={mobileLinkClass}>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
