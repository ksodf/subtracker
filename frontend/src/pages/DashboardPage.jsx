import AppNav from '../components/AppNav';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppNav />

      <main className="max-w-5xl mx-auto px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:py-8 md:pb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-5 dark:text-gray-100 sm:text-2xl sm:mb-6">Dashboard</h2>
        <Dashboard />
      </main>
    </div>
  );
}
