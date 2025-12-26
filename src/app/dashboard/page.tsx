import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Header />
      <Dashboard />
    </ProtectedRoute>
  );
}

