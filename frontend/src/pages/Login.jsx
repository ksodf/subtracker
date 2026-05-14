import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 dark:bg-gray-950">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">SubTracker</h1>
          <ThemeToggle />
        </div>
        <p className="text-gray-500 text-sm mt-1 mb-6 dark:text-gray-400">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" required autoComplete="email"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={form.email} onChange={e => set('email', e.target.value)}
          />
          <input
            type="password" placeholder="Password" required autoComplete="current-password"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={form.password} onChange={e => set('password', e.target.value)}
          />
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center dark:text-gray-400">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium dark:text-blue-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
