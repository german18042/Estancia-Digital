'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, type Usuario } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!usuario;

  const verificarAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data.usuario);
      } else {
        setUsuario(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUsuario(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      setUsuario(data.usuario);
      console.log('Login exitoso, usuario:', data.usuario);

      // Redirigir según el rol
      setTimeout(() => {
        console.log('Redirigiendo a:', data.usuario.rol === 'administrador' ? '/admin' : '/');
        if (data.usuario.rol === 'administrador') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 500);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUsuario(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    verificarAuth();
  }, []);

  const contextValue = {
    usuario,
    isLoading,
    isAuthenticated,
    login,
    logout,
    verificarAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
