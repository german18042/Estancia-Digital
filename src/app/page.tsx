import RegistroVacasApp from '@/components/RegistroVacasApp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function Home() {
  return (
    <ProtectedRoute>
      <Header />
      <RegistroVacasApp />
    </ProtectedRoute>
  );
}
