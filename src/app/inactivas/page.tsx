'use client';

import { useRequireAuth } from '@/hooks/useAuth';
import ListaVacasInactivas from '@/components/ListaVacasInactivas';
import Header from '@/components/Header';

export default function VacasInactivasPage() {
  useRequireAuth();

  return (
    <>
      <Header />
      <ListaVacasInactivas />
    </>
  );
}

