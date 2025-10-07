import RegistroVacasApp from '@/components/RegistroVacasApp';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <RegistroVacasApp />
    </ProtectedRoute>
  );
}
