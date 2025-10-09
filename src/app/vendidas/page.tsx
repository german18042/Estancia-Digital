'use client';

import { useRequireAuth } from '@/hooks/useAuth';
import ListaVacasVendidas from '@/components/ListaVacasVendidas';
import Header from '@/components/Header';

export default function VacasVendidasPage() {
  useRequireAuth();

  return (
    <>
      <Header />
      <ListaVacasVendidas />
    </>
  );
}

