'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const Navigation: React.FC = () => {
  const { usuario, logout } = useAuth();
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!usuario) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">🐄</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                Sistema de Vacas
              </span>
            </div>
          </div>

          {/* Navegación principal */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-green-600 transition-colors text-sm xl:text-base"
            >
              📋 Registro de Vacas
            </Link>
            <Link
              href="/gestacion"
              className="text-gray-700 hover:text-green-600 transition-colors text-sm xl:text-base"
            >
              🐄 Gestación
            </Link>
            <Link
              href="/trazabilidad"
              className="text-gray-700 hover:text-green-600 transition-colors text-sm xl:text-base"
            >
              📊 Trazabilidad
            </Link>
            {usuario.rol === 'administrador' && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-green-600 transition-colors text-sm xl:text-base"
              >
                👤 Admin
              </Link>
            )}
          </div>

          {/* Información del usuario */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Información del usuario */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {usuario.nombre}
                </div>
                <div className="text-xs text-gray-500">
                  {usuario.rol === 'administrador' ? 'Administrador' : 'Usuario'}
                </div>
              </div>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                usuario.rol === 'administrador' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={() => setMostrarMenu(!mostrarMenu)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mostrarMenu && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors text-sm"
                onClick={() => setMostrarMenu(false)}
              >
                📋 Registro de Vacas
              </Link>
              <Link
                href="/gestacion"
                className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors text-sm"
                onClick={() => setMostrarMenu(false)}
              >
                🐄 Gestión de Gestación
              </Link>
              <Link
                href="/trazabilidad"
                className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors text-sm"
                onClick={() => setMostrarMenu(false)}
              >
                📊 Trazabilidad
              </Link>
              {usuario.rol === 'administrador' && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors text-sm"
                  onClick={() => setMostrarMenu(false)}
                >
                  👤 Administración
                </Link>
              )}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-gray-900">
                    {usuario.nombre}
                  </div>
                  <div className="text-xs text-gray-500">
                    {usuario.rol === 'administrador' ? 'Administrador' : 'Usuario'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
