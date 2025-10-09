'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      
      // Si hay callback personalizado
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError(error instanceof Error ? error.message : 'Error en el login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-green-800 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos temáticos decorativos */}
      
      
      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div>
          <div className="mx-auto flex items-center justify-center mb-8">
            <div className="relative w-60 h-40 sm:w-60 sm:h-40 group">
              <Image
                src="/imagenes/logo.png"
                alt="Logo Sistema Ganadero"
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg"
                priority
              />
            </div>
          </div>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            Sistema de Gestión de Vacas
          </h2>
          <p className="mt-3 text-center text-base text-green-100 drop-shadow-sm">
            Inicia sesión para acceder al sistema
          </p>
        </div>
        
        <form className="mt-8 sm:mt-10 space-y-6 sm:space-y-8 bg-white bg-opacity-95 backdrop-blur-md rounded-2xl p-8 sm:p-10 border-2 border-green-600 shadow-2xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-green-800 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-green-600 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 bg-white text-sm sm:text-base shadow-lg transition-all duration-300"
                placeholder="Dirección de email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-green-800 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-green-600 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 bg-white text-sm sm:text-base shadow-lg transition-all duration-300"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-xl shadow-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 sm:py-4 px-6 border-2 border-green-600 text-sm sm:text-base font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="text-sm sm:text-base">Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
        
        {/* Elemento temático adicional */}
        <div className="flex justify-center items-center space-x-4 text-green-200 text-xs opacity-60">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Gestión Inteligente</span>
          </div>
          <div className="w-1 h-1 bg-green-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>Ubicación Precisa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
