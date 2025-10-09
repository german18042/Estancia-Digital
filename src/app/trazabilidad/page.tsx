import TrazabilidadGestacionApp from '@/components/TrazabilidadGestacionApp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function TrazabilidadPage() {
  return (
    <ProtectedRoute>
      <Header />
      <TrazabilidadGestacionApp />
    </ProtectedRoute>
  );
}
