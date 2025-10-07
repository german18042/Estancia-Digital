import AdminPanel from '@/components/AdminPanel';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <AdminPanel />
    </ProtectedRoute>
  );
}
