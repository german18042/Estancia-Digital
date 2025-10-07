'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FormularioUbicacion from './FormularioUbicacion';
import ListaUbicaciones from './ListaUbicaciones';

interface Ubicacion {
  _id: string;
  nombre: string;
  tipo: string;
  capacidad?: number;
  area?: number;
  descripcion?: string;
  caracteristicas?: string[];
  estado: string;
}

const GestionUbicacionesApp: React.FC = () => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ubicacionEditando, setUbicacionEditando] = useState<Ubicacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
                📍 Gestión de Ubicaciones
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
                🐄 Vacas
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
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleNuevaUbicacion}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
              >
                + Nueva Ubicación
              </button>
            </div>

            <ListaUbicaciones
              ubicaciones={ubicaciones}
              onEditar={handleEditarUbicacion}
              onEliminar={handleEliminarUbicacion}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div>
            <FormularioUbicacion
              onSubmit={handleSubmitFormulario}
              isLoading={isLoading}
              datosIniciales={ubicacionEditando || {}}
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

