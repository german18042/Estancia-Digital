import GestionGestacionApp from '@/components/GestionGestacionApp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function GestacionPage() {
  return (
    <ProtectedRoute>
      <Header />
      <GestionGestacionApp />
    </ProtectedRoute>
  );
}
