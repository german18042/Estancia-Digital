'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FormularioGestacion from './FormularioGestacion';
import ListaGestaciones from './ListaGestaciones';
import ModalRegistroParto from './ModalRegistroParto';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  sexo: string;
}

interface Gestacion {
  _id: string;
  vacaId: string;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  fechaServicio?: string;
  fechaConfirmacion?: string;
  diasGestacionConfirmados?: number;
  fechaProbableParto: string;
  diasGestacionActual?: number;
  trimestreActual?: number;
  estado: string;
  tipoServicio: string;
  toroPadre?: string;
  pesoActual?: number;
  pesoInicial?: number;
  gananciaPeso?: number;
}

interface Estadisticas {
  resumen: {
    totalGestaciones: number;
    gestacionesActivas: number;
    partosExitosos: number;
    abortos: number;
    cercaDelParto: number;
    periodoCritico: number;
  };
  proximosPartos: Array<{
    numeroIdentificacionVaca: string;
    nombreVaca?: string;
    fechaProbableParto: string;
    diasGestacionActual?: number;
  }>;
}

const GestionGestacionApp: React.FC = () => {
  const [gestaciones, setGestaciones] = useState<Gestacion[]>([]);
  const [vacas, setVacas] = useState<Vaca[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [gestacionEditando, setGestacionEditando] = useState<Gestacion | null>(null);
  const [gestacionParaParto, setGestacionParaParto] = useState<Gestacion | null>(null);
  const [errorParto, setErrorParto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [gestacionesRes, vacasRes, estadisticasRes] = await Promise.all([
        fetch('/api/gestacion'),
        fetch('/api/vacas'),
        fetch('/api/gestacion/estadisticas')
      ]);

      if (!gestacionesRes.ok || !vacasRes.ok || !estadisticasRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [gestacionesData, vacasData, estadisticasData] = await Promise.all([
        gestacionesRes.json(),
        vacasRes.json(),
        estadisticasRes.json()
      ]);

      setGestaciones(gestacionesData.gestaciones || []);
      setVacas(vacasData.vacas || []);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFormulario = async (datosGestacion: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      
      if (gestacionEditando) {
        // Actualizar gestación existente
        response = await fetch(`/api/gestacion/${gestacionEditando._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosGestacion),
        });
      } else {
        // Crear nueva gestación
        response = await fetch('/api/gestacion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosGestacion),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar la gestación');
      }

      await response.json();
      
      if (gestacionEditando) {
        setSuccessMessage('Gestación actualizada exitosamente');
      } else {
        setSuccessMessage('Gestación registrada exitosamente');
      }

      // Limpiar formulario y cerrar
      setMostrarFormulario(false);
      setGestacionEditando(null);
      
      // Recargar todos los datos
      await cargarDatos();
      
    } catch (error) {
      console.error('Error al guardar gestación:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar la gestación');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('/api/gestacion/estadisticas');
      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleEditarGestacion = (gestacion: Gestacion) => {
    setGestacionEditando(gestacion);
    setMostrarFormulario(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleEliminarGestacion = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta gestación?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gestacion/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la gestación');
      }

      setSuccessMessage('Gestación eliminada exitosamente');
      
      // Recargar todos los datos
      await cargarDatos();
      
    } catch (error) {
      console.error('Error al eliminar gestación:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar la gestación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuevaGestacion = () => {
    setGestacionEditando(null);
    setMostrarFormulario(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setGestacionEditando(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleRegistrarParto = (gestacion: Gestacion) => {
    setGestacionParaParto(gestacion);
    setErrorParto(null); // Limpiar error anterior
  };

  const handleConfirmarParto = async (datos: any) => {
    if (!gestacionParaParto) return;

    setIsLoading(true);
    setErrorParto(null); // Limpiar error anterior

    try {
      // Actualizar la gestación con los datos del parto
      const datosActualizacion: any = {
        activa: false,
        fechaPartoReal: datos.fechaPartoReal,
        complicacionesParto: datos.complicacionesParto
      };

      if (datos.resultado === 'parto') {
        datosActualizacion.estado = 'parto_exitoso'; // Valor correcto del enum
        // Mapear tipoParto a los valores correctos del enum
        const mapaTipoParto: { [key: string]: string } = {
          'natural': 'normal',
          'cesarea': 'cesarea',
          'inducido': 'asistido'
        };
        datosActualizacion.tipoParto = mapaTipoParto[datos.tipoParto] || 'normal';
        datosActualizacion.crias = datos.crias;

        // Registrar las crías como nuevas vacas
        for (const cria of datos.crias) {
          const responseVaca = await fetch('/api/vacas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              numeroIdentificacion: cria.numeroIdentificacion,
              nombre: `Cría de ${gestacionParaParto.numeroIdentificacionVaca}`,
              sexo: cria.sexo,
              fechaNacimiento: datos.fechaPartoReal,
              peso: cria.pesoNacimiento,
              alturaCruz: 60, // Valor estimado para cría
              raza: 'Por definir',
              colorPelaje: 'Por definir',
              estadoReproductivo: 'vacia', // Cría recién nacida, aún no en edad reproductiva
              condicionCorporal: 3,
              estadoSalud: 'Sano',
              ubicacionActual: 'Corral de crías',
              madre: gestacionParaParto.numeroIdentificacionVaca, // Vincular con la madre
              padre: gestacionParaParto.toroPadre || undefined, // Vincular con el padre si existe
              observaciones: `Cría recién nacida - Hijo/a de ${gestacionParaParto.numeroIdentificacionVaca}${gestacionParaParto.toroPadre ? ` y ${gestacionParaParto.toroPadre}` : ''}. ${cria.observaciones || ''}`.trim()
            }),
          });

          if (!responseVaca.ok) {
            const errorData = await responseVaca.json();
            throw new Error(`Error al registrar cría ${cria.numeroIdentificacion}: ${errorData.error || 'Error desconocido'}`);
          }
        }
      } else {
        datosActualizacion.estado = 'aborto';
      }

      // Primero obtener la gestación actual completa
      const gestacionActual = await fetch(`/api/gestacion/${gestacionParaParto._id}`);
      if (!gestacionActual.ok) {
        throw new Error('Error al obtener gestación actual');
      }
      const datosGestacionActual = await gestacionActual.json();

      // Actualizar la gestación con todos los datos existentes
      const response = await fetch(`/api/gestacion/${gestacionParaParto._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...datosGestacionActual,
          ...datosActualizacion,
          // No recalcular fechas cuando ya está completada
          fechaServicio: datosGestacionActual.fechaServicio,
          fechaConfirmacion: datosGestacionActual.fechaConfirmacion,
          diasGestacionConfirmados: datosGestacionActual.diasGestacionConfirmados
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al actualizar gestación: ${errorData.error || 'Error desconocido'}`);
      }

      setSuccessMessage(
        datos.resultado === 'parto'
          ? `Parto registrado exitosamente. ${datos.crias.length} cría(s) agregada(s) al inventario.`
          : 'Aborto registrado en el sistema.'
      );
      setGestacionParaParto(null); // Cerrar modal solo si fue exitoso
      
      // Recargar datos
      await cargarDatos();
      
    } catch (error) {
      console.error('Error al registrar parto:', error);
      setErrorParto(error instanceof Error ? error.message : 'Error al registrar el parto');
      // NO cerramos el modal para que el usuario pueda corregir el error
    } finally {
      setIsLoading(false);
    }
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
                Gestión de Gestación de Vacas
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Administra el seguimiento completo del ciclo reproductivo de tu ganado
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-center text-sm sm:text-base"
              >
                📋 Registro de Vacas
              </Link>
              <Link
                href="/trazabilidad"
                className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-center text-sm sm:text-base"
              >
                📊 Trazabilidad
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

        {/* Estadísticas */}
        {estadisticas && !mostrarFormulario && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Gestaciones Activas</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{estadisticas.resumen.gestacionesActivas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cerca del Parto</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.resumen.cercaDelParto}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Período Crítico</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.resumen.periodoCritico}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partos Exitosos</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.resumen.partosExitosos}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Próximos Partos */}
        {estadisticas?.proximosPartos && estadisticas.proximosPartos.length > 0 && !mostrarFormulario && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Próximos Partos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estadisticas.proximosPartos.slice(0, 6).map((parto, index) => {
                const fecha = new Date(parto.fechaProbableParto);
                const diasRestantes = Math.ceil((fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const esCritica = diasRestantes <= 14;
                
                return (
                  <div key={index} className={`p-4 rounded-lg border ${esCritica ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="font-medium text-gray-900">{parto.numeroIdentificacionVaca}</div>
                    {parto.nombreVaca && (
                      <div className="text-sm text-gray-600">{parto.nombreVaca}</div>
                    )}
                    <div className={`text-sm font-medium ${esCritica ? 'text-red-600' : 'text-gray-700'}`}>
                      {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {fecha.toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {mostrarFormulario ? (
          <FormularioGestacion
            onSubmit={handleSubmitFormulario}
            isLoading={isLoading}
            datosIniciales={gestacionEditando || {}}
            vacasDisponibles={vacas}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Registro de Gestaciones
              </h2>
              <button
                onClick={handleNuevaGestacion}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                + Nueva Gestación
              </button>
            </div>

            <ListaGestaciones
              gestaciones={gestaciones}
              onEditar={handleEditarGestacion}
              onEliminar={handleEliminarGestacion}
              onRegistrarParto={handleRegistrarParto}
              isLoading={isLoading}
            />
          </div>
        )}

        {mostrarFormulario && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCancelarFormulario}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Volver a la Lista
            </button>
          </div>
        )}
      </div>

      {/* Modal de registro de parto */}
      {gestacionParaParto && (
        <ModalRegistroParto
          gestacion={gestacionParaParto}
          onClose={() => {
            setGestacionParaParto(null);
            setErrorParto(null);
          }}
          onRegistrar={handleConfirmarParto}
          errorExterno={errorParto}
        />
      )}
    </div>
  );
};

export default GestionGestacionApp;
