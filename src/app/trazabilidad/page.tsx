import TrazabilidadGestacionApp from '@/components/TrazabilidadGestacionApp';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TrazabilidadPage() {
  return (
    <ProtectedRoute>
      <TrazabilidadGestacionApp />
    </ProtectedRoute>
  );
}
