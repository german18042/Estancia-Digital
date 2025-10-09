'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };


  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    
    if (isActive) {
      return `${baseClasses} bg-white text-green-600 shadow-md`;
    }
    return `${baseClasses} text-white hover:bg-white hover:bg-opacity-20 hover:text-green-600`;
  };

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-30 h-30 sm:w-60 sm:h-30">
              <Image
                src="/imagenes/logo.png"
                alt="Logo Sistema Ganadero"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Menú Desktop */}
          <nav className="hidden lg:flex space-x-2">
            <Link href="/" className={getLinkClasses('/')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </Link>
            <Link href="/gestacion" className={getLinkClasses('/gestacion')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gestación
            </Link>
            <Link href="/trazabilidad" className={getLinkClasses('/trazabilidad')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Trazabilidad
            </Link>
            <Link href="/ubicaciones" className={getLinkClasses('/ubicaciones')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicaciones
            </Link>
            <Link href="/vendidas" className={getLinkClasses('/vendidas')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Vendidas
            </Link>
            <Link href="/inactivas" className={getLinkClasses('/inactivas')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Fallecidas
            </Link>
          </nav>

          {/* Información del usuario y logout */}
          <div className="hidden lg:flex items-center space-x-4">
            {usuario && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white text-sm">
                    {usuario.nombre}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white text-sm px-3 py-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="lg:hidden text-white p-2 rounded-md hover:bg-white hover:bg-opacity-20"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuAbierto ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menú Móvil */}
        {menuAbierto && (
          <nav className="lg:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link href="/" className={getLinkClasses('/')} onClick={() => setMenuAbierto(false)}>
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </Link>
              <Link href="/gestacion" className={getLinkClasses('/gestacion')} onClick={() => setMenuAbierto(false)}>
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gestación
              </Link>
              <Link href="/trazabilidad" className={getLinkClasses('/trazabilidad')} onClick={() => setMenuAbierto(false)}>
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Trazabilidad
              </Link>
              <Link href="/ubicaciones" className={getLinkClasses('/ubicaciones')} onClick={() => setMenuAbierto(false)}>
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ubicaciones
              </Link>
              <Link href="/vendidas" className={getLinkClasses('/vendidas')} onClick={() => setMenuAbierto(false)}>
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Vendidas
              </Link>
              <Link href="/inactivas" className={getLinkClasses('/inactivas')} onClick={() => setMenuAbierto(false)}>
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Fallecidas
              </Link>
              
              {/* Información del usuario en móvil */}
              {usuario && (
                <div className="border-t border-white border-opacity-20 pt-2 mt-2">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white text-sm">
                      {usuario.nombre}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuAbierto(false);
                    }}
                    className="w-full text-left text-white text-sm px-3 py-2 hover:bg-white hover:bg-opacity-20 transition-colors duration-200 rounded-md"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;