import ConfiguracionApp from '@/components/ConfiguracionApp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function ConfiguracionPage() {
  return (
    <ProtectedRoute>
      <Header />
      <ConfiguracionApp />
    </ProtectedRoute>
  );
}

