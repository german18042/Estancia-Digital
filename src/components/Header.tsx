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

  // Estilos para enlaces desktop
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    
    if (isActive) {
      return `${baseClasses} bg-white text-green-600 shadow-md`;
    }
    return `${baseClasses} text-white hover:bg-white hover:bg-opacity-20 hover:text-green-600`;
  };

  // Estilos para enlaces móviles
  const getMobileLinkClasses = (href: string) => {
    const isActive = pathname === href;
    const baseClasses = "flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors duration-200";
    
    if (isActive) {
      return `${baseClasses} bg-green-800 text-white border-l-4 border-white`;
    }
    return `${baseClasses} text-white hover:bg-green-800`;
  };

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-24 h-16 sm:w-48 sm:h-20">
              <Image
                src="/imagenes/logo.png"
                alt="Logo Sistema Ganadero"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Menú Desktop - Reorganizado y con iconos apropiados */}
          <nav className="hidden lg:flex space-x-2">
            {/* 1. Dashboard - Inicio/Home */}
            <Link href="/dashboard" className={getLinkClasses('/dashboard')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </Link>
            
            {/* 2. Inventario - Lista/Registro */}
            <Link href="/" className={getLinkClasses('/')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Inventario
            </Link>
            
            {/* 3. Gestación - Corazón (amor/cuidado) */}
            <Link href="/gestacion" className={getLinkClasses('/gestacion')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Gestación
            </Link>
            
            {/* 4. Producción Lechera - Gota/Descarga */}
            <Link href="/produccion-lechera" className={getLinkClasses('/produccion-lechera')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Producción
            </Link>
            
            {/* 5. Gestión Sanitaria - Cruz médica simple */}
            <Link href="/gestion-sanitaria" className={getLinkClasses('/gestion-sanitaria')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Salud
            </Link>
            
            {/* 6. Ubicaciones - Pin de mapa */}
            <Link href="/ubicaciones" className={getLinkClasses('/ubicaciones')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicaciones
            </Link>
            
            {/* 7. Trazabilidad - Gráfico de barras (historial/análisis) */}
            <Link href="/trazabilidad" className={getLinkClasses('/trazabilidad')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Historial
            </Link>
            
            {/* 8. Configuración - Engranaje */}
            <Link href="/configuracion" className={getLinkClasses('/configuracion')}>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Config
            </Link>
          </nav>

          {/* Información del usuario y logout - Desktop */}
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

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="lg:hidden text-white p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            {menuAbierto ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {menuAbierto && (
        <div className="lg:hidden bg-green-700 border-t border-green-600">
          <nav className="container mx-auto px-2 py-3 space-y-1">
            {/* Navegación Móvil con todos los enlaces */}
            <Link 
              href="/dashboard" 
              className={getMobileLinkClasses('/dashboard')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </Link>
            
            <Link 
              href="/" 
              className={getMobileLinkClasses('/')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Inventario
            </Link>
            
            <Link 
              href="/gestacion" 
              className={getMobileLinkClasses('/gestacion')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Gestación
            </Link>
            
            <Link 
              href="/produccion-lechera" 
              className={getMobileLinkClasses('/produccion-lechera')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Producción
            </Link>
            
            <Link 
              href="/gestion-sanitaria" 
              className={getMobileLinkClasses('/gestion-sanitaria')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Salud
            </Link>
            
            <Link 
              href="/ubicaciones" 
              className={getMobileLinkClasses('/ubicaciones')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicaciones
            </Link>
            
            <Link 
              href="/trazabilidad" 
              className={getMobileLinkClasses('/trazabilidad')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Historial
            </Link>
            
            <Link 
              href="/configuracion" 
              className={getMobileLinkClasses('/configuracion')}
              onClick={() => setMenuAbierto(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Config
            </Link>

            {/* Sección de Usuario en Móvil */}
            {usuario && (
              <>
                <div className="border-t border-green-600 my-3 pt-3">
                  <div className="flex items-center px-4 py-2 text-white">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{usuario.nombre}</p>
                      <p className="text-xs text-green-200">{usuario.email}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuAbierto(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
