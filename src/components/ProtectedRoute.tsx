'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import Navigation from './Navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'administrador' | 'usuario';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { usuario, isLoading } = useRequireAuth(requiredRole);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return null; // El hook useRequireAuth ya maneja la redirección
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
};

export default ProtectedRoute;

