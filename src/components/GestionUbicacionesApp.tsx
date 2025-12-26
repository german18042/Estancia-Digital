'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import FormularioUbicacion from './FormularioUbicacion';
import ListaUbicaciones from './ListaUbicaciones';

// Importar el mapa dinámicamente para evitar problemas SSR
const MapaUbicacion = dynamic(() => import('./MapaUbicacion'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 flex items-center justify-center rounded-lg">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>
  )
});

interface Ubicacion {
  _id: string;
  nombre: string;
  tipo: string;
  capacidad?: number;
  area?: number;
  geometria?: any;
  tipoPasto?: string;
  sistemaRiego?: string;
  descripcion?: string;
  caracteristicas?: string[];
  estado: string;
}

const GestionUbicacionesApp: React.FC = () => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(true); // Mostrar mapa por defecto
  const [ubicacionEditando, setUbicacionEditando] = useState<Ubicacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Coordenadas del centro del mapa - desde ubicación de la finca o valores por defecto
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    if (typeof window !== 'undefined') {
      const fincaLat = localStorage.getItem('fincaLat');
      const fincaLng = localStorage.getItem('fincaLng');
      if (fincaLat && fincaLng) {
        return [parseFloat(fincaLat), parseFloat(fincaLng)];
      }
      // Fallback a coordenadas guardadas anteriormente
      const savedLat = localStorage.getItem('mapCenterLat');
      const savedLng = localStorage.getItem('mapCenterLng');
      if (savedLat && savedLng) {
        return [parseFloat(savedLat), parseFloat(savedLng)];
      }
    }
    return [-34.6037, -58.3816]; // Buenos Aires por defecto
  });
  
  const [mapZoom, setMapZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedZoom = localStorage.getItem('mapZoom');
      if (savedZoom) {
        return parseInt(savedZoom);
      }
    }
    return 16; // Zoom más cercano para ver la casa principal
  });

  useEffect(() => {
    cargarUbicaciones();
  }, []);

  const cargarUbicaciones = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ubicaciones');
      if (response.ok) {
        const data = await response.json();
        setUbicaciones(data.ubicaciones || []);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
      setError('Error al cargar las ubicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFormulario = async (datosUbicacion: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      
      if (ubicacionEditando) {
        response = await fetch(`/api/ubicaciones/${ubicacionEditando._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosUbicacion),
        });
      } else {
        response = await fetch('/api/ubicaciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosUbicacion),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la ubicación');
      }

      setSuccessMessage(
        ubicacionEditando
          ? 'Ubicación actualizada exitosamente'
          : 'Ubicación registrada exitosamente'
      );
      setMostrarFormulario(false);
      setUbicacionEditando(null);
      
      await cargarUbicaciones();
      
    } catch (error) {
      console.error('Error al guardar ubicación:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la ubicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarUbicacion = (ubicacion: Ubicacion) => {
    setUbicacionEditando(ubicacion);
    setMostrarFormulario(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEliminarUbicacion = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ubicaciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la ubicación');
      }

      setSuccessMessage('Ubicación eliminada exitosamente');
      await cargarUbicaciones();
      
    } catch (error) {
      console.error('Error al eliminar ubicación:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar la ubicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevaUbicacion = () => {
    setUbicacionEditando(null);
    setMostrarFormulario(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setUbicacionEditando(null);
    setError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gestión de Ubicaciones
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Administra los espacios de tu finca
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vacas
              </Link>
              <Link
                href="/gestacion"
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                🤰 Gestación
              </Link>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {/* Contenido principal */}
        {!mostrarFormulario ? (
          <div className="space-y-6">
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setMostrarMapa(!mostrarMapa)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm sm:text-base"
                >
                  {mostrarMapa ? '📋 Ver Lista' : '🗺️ Ver Mapa'}
                </button>
              </div>
              <button
                onClick={handleNuevaUbicacion}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
              >
                + Nueva Ubicación
              </button>
            </div>

            {/* Vista de mapa o lista */}
            {mostrarMapa ? (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                  Mapa de Potreros y Ubicaciones
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Visualiza todos tus potreros delimitados en el mapa satelital. Haz clic en cada polígono para ver más información.
                </p>
                
                <MapaUbicacion
                  geometriasExistentes={ubicaciones.filter(u => u.geometria)}
                  editable={false}
                  height="600px"
                  center={mapCenter}
                  zoom={mapZoom}
                  showFincaMarker={true}
                  onPolygonClick={(geo) => {
                    const ubicacion = ubicaciones.find(u => u._id === geo._id);
                    if (ubicacion) {
                      handleEditarUbicacion(ubicacion);
                    }
                  }}
                  onFincaLocationSet={(lat, lng) => {
                    setMapCenter([lat, lng]);
                    setMapZoom(16);
                  }}
                />
                {ubicaciones.filter(u => u.geometria).length === 0 && (
                  <p className="mt-4 text-center text-gray-500">
                    No hay ubicaciones con polígonos delimitados. Crea una nueva ubicación y dibuja su área en el mapa.
                  </p>
                )}
              </div>
            ) : (
              <ListaUbicaciones
                ubicaciones={ubicaciones}
                onEditar={handleEditarUbicacion}
                onEliminar={handleEliminarUbicacion}
                isLoading={isLoading}
              />
            )}
          </div>
        ) : (
          <div>
            <FormularioUbicacion
              onSubmit={handleSubmitFormulario}
              isLoading={isLoading}
              datosIniciales={ubicacionEditando || {}}
              ubicacionesExistentes={ubicaciones}
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCancelarFormulario}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Volver a la Lista
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUbicacionesApp;

