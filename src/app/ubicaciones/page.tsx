import React from 'react';
import GestionUbicacionesApp from '@/components/GestionUbicacionesApp';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

export default function UbicacionesPage() {
  return (
    <ProtectedRoute>
      <Header />
      <GestionUbicacionesApp />
    </ProtectedRoute>
  );
}

