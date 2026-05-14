import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPage from './pages/DashboardPage';
import SubscriptionListPage from './pages/SubscriptionListPage';
import TransactionFormPage from './pages/TransactionFormPage';
import ReportsPage from './pages/ReportsPage';
import SyncPage from './pages/SyncPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <PrivateRoute>
                <SubscriptionListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscriptions/new"
            element={
              <PrivateRoute>
                <TransactionFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscriptions/:id/edit"
            element={
              <PrivateRoute>
                <TransactionFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sync"
            element={
              <PrivateRoute>
                <SyncPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
