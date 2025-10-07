'use client';

import { createContext } from 'react';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'administrador' | 'usuario';
  ultimoAcceso?: string;
  fechaCreacion: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verificarAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type { Usuario, AuthContextType };

