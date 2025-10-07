'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, type AuthContextType } from '@/contexts/AuthContext';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Hook para proteger rutas
export function useRequireAuth(requiredRole?: 'administrador' | 'usuario') {
  const { usuario, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && requiredRole && usuario?.rol !== requiredRole) {
      router.push('/');
    }
  }, [isLoading, requiredRole, usuario, router]);

  return { usuario, isLoading, isAuthenticated };
}

