import GestionSanitariaApp from '@/components/GestionSanitariaApp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function GestionSanitariaPage() {
  return (
    <ProtectedRoute>
      <Header />
      <GestionSanitariaApp />
    </ProtectedRoute>
  );
}

