import React from 'react';
import GestionUbicacionesApp from '@/components/GestionUbicacionesApp';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UbicacionesPage() {
  return (
    <ProtectedRoute>
      <GestionUbicacionesApp />
    </ProtectedRoute>
  );
}

