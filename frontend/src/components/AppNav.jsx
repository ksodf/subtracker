import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `text-sm rounded-lg px-3 py-1.5 transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-600 font-medium'
      : 'text-gray-600 hover:bg-gray-50'
  }`;

export default function AppNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xl font-bold text-blue-600">SubTracker</span>
          <div className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/subscriptions" end className={linkClass}>
              Subscriptions
            </NavLink>
            <NavLink to="/subscriptions/new" className={linkClass}>
              + Add
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
            <NavLink to="/sync" className={linkClass}>
              Sync
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-600 border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
