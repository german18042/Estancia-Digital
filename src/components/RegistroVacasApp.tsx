'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FormularioRegistroVaca from './FormularioRegistroVaca';
import ListaVacas from './ListaVacas';
import ModalCambiarUbicacion from './ModalCambiarUbicacion';
import DetalleVaca from './DetalleVaca';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  fechaNacimiento: string;
  sexo: 'macho' | 'hembra';
  raza: string;
  colorPelaje: string;
  peso: number;
  alturaCruz: number;
  estadoReproductivo: string;
  ubicacionActual: string;
  condicionCorporal: number;
  produccionLecheraDiaria?: number;
  activa: boolean;
}

const RegistroVacasApp: React.FC = () => {
  const [vacas, setVacas] = useState<Vaca[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vacaEditando, setVacaEditando] = useState<Vaca | null>(null);
  const [vacaParaUbicar, setVacaParaUbicar] = useState<Vaca | null>(null);
  const [vacaParaDetalles, setVacaParaDetalles] = useState<Vaca | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar vacas al montar el componente
  useEffect(() => {
    cargarVacas();
  }, []);

  const cargarVacas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/vacas');
      if (!response.ok) {
        throw new Error('Error al cargar las vacas');
      }
      const data = await response.json();
      setVacas(data.vacas || []);
    } catch (error) {
      console.error('Error al cargar vacas:', error);
      setError('Error al cargar las vacas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFormulario = async (datosVaca: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      
      if (vacaEditando) {
        // Actualizar vaca existente
        response = await fetch(`/api/vacas/${vacaEditando._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosVaca),
        });
      } else {
        // Crear nueva vaca
        response = await fetch('/api/vacas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosVaca),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la vaca');
      }

      const vacaGuardada = await response.json();
      
      if (vacaEditando) {
        // Actualizar la vaca en la lista
        setVacas(vacas.map(v => v._id === vacaEditando._id ? vacaGuardada : v));
        setSuccessMessage('Vaca actualizada exitosamente');
      } else {
        // Agregar nueva vaca a la lista
        setVacas([vacaGuardada, ...vacas]);
        setSuccessMessage('Vaca registrada exitosamente');
      }

      // Limpiar formulario y cerrar
      setMostrarFormulario(false);
      setVacaEditando(null);
      
    } catch (error) {
      console.error('Error al guardar vaca:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la vaca');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarVaca = (vaca: Vaca) => {
    setVacaEditando(vaca);
    setMostrarFormulario(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCambiarUbicacion = (vaca: Vaca) => {
    setVacaParaUbicar(vaca);
  };

  const handleVerDetalles = (vaca: Vaca) => {
    setVacaParaDetalles(vaca);
  };

  const handleConfirmarCambioUbicacion = async (datos: {
    ubicacionNueva: string;
    motivo: string;
    observaciones?: string;
  }) => {
    if (!vacaParaUbicar) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/vacas/${vacaParaUbicar._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ubicacionActual: datos.ubicacionNueva,
          historialMovimientos: [{
            fecha: new Date(),
            ubicacionAnterior: vacaParaUbicar.ubicacionActual,
            ubicacionNueva: datos.ubicacionNueva,
            motivo: datos.motivo,
            observaciones: datos.observaciones
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar ubicación');
      }

      setSuccessMessage(`Ubicación cambiada a: ${datos.ubicacionNueva}`);
      setVacaParaUbicar(null);
      
      // Recargar vacas
      await cargarVacas();
      
    } catch (error) {
      console.error('Error al cambiar ubicación:', error);
      setError(error instanceof Error ? error.message : 'Error al cambiar ubicación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarVaca = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta vaca?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vacas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la vaca');
      }

      // Remover la vaca de la lista
      setVacas(vacas.filter(v => v._id !== id));
      setSuccessMessage('Vaca eliminada exitosamente');
      
    } catch (error) {
      console.error('Error al eliminar vaca:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar la vaca');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevaVaca = () => {
    setVacaEditando(null);
    setMostrarFormulario(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setVacaEditando(null);
    setError(null);
    setSuccessMessage(null);
  };

  // Limpiar mensajes después de 5 segundos
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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Sistema de Registro de Vacas
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Gestiona el inventario completo de tu ganado con información detallada
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link
                href="/gestacion"
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-center text-sm sm:text-base"
              >
                🐄 Gestión de Gestación
              </Link>
              <Link
                href="/trazabilidad"
                className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-center text-sm sm:text-base"
              >
                📊 Trazabilidad
              </Link>
              <Link
                href="/ubicaciones"
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-center text-sm sm:text-base"
              >
                📍 Ubicaciones
              </Link>
            </div>
          </div>
        </div>

        {/* Mensajes de éxito y error */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {mostrarFormulario ? (
          <FormularioRegistroVaca
            onSubmit={handleSubmitFormulario}
            isLoading={isLoading}
            datosIniciales={vacaEditando || {}}
            vacasRegistradas={vacas.map(vaca => ({
              _id: vaca._id,
              numeroIdentificacion: vaca.numeroIdentificacion,
              nombre: vaca.nombre,
              sexo: vaca.sexo
            }))}
          />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Inventario de Vacas
              </h2>
              <button
                onClick={handleNuevaVaca}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base w-full sm:w-auto"
              >
                + Nueva Vaca
              </button>
            </div>

            <ListaVacas
              vacas={vacas}
              onEditar={handleEditarVaca}
              onEliminar={handleEliminarVaca}
              onCambiarUbicacion={handleCambiarUbicacion}
              onVerDetalles={handleVerDetalles}
              isLoading={isLoading}
            />
          </div>
        )}

        {mostrarFormulario && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCancelarFormulario}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Volver a la Lista
            </button>
          </div>
        )}
      </div>

      {/* Modal de cambio de ubicación */}
      {vacaParaUbicar && (
        <ModalCambiarUbicacion
          vaca={vacaParaUbicar}
          onClose={() => setVacaParaUbicar(null)}
          onCambiar={handleConfirmarCambioUbicacion}
        />
      )}

      {/* Modal de detalles completos */}
      {vacaParaDetalles && (
        <DetalleVaca
          vacaId={vacaParaDetalles._id}
          onCerrar={() => setVacaParaDetalles(null)}
        />
      )}
    </div>
  );
};

export default RegistroVacasApp;
