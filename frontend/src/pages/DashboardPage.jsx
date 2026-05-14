import AppNav from '../components/AppNav';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <Dashboard />
      </main>
    </div>
  );
}
