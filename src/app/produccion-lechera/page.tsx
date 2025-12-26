import GestionProduccionLecheraApp from '@/components/GestionProduccionLecheraApp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function ProduccionLecheraPage() {
  return (
    <ProtectedRoute>
      <Header />
      <GestionProduccionLecheraApp />
    </ProtectedRoute>
  );
}

