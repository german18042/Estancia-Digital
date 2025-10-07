import GestionGestacionApp from '@/components/GestionGestacionApp';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function GestacionPage() {
  return (
    <ProtectedRoute>
      <GestionGestacionApp />
    </ProtectedRoute>
  );
}
