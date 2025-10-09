'use client';

import React, { useState, useEffect } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  fechaNacimiento: string;
  raza: string;
  sexo: string;
}

interface Evento {
  fecha: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  color: string;
  icono: string;
  observaciones?: string | null;
  complicaciones?: string | null;
  detallesAdicionales?: any;
}

interface Estadisticas {
  totalGestaciones: number;
  partosExitosos: number;
  abortos: number;
  gestacionActual?: any;
  primeraGestacion?: any;
  ultimaGestacion?: any;
  intervaloEntrePartos: number[];
}

interface Resumen {
  edadVaca: number;
  totalCrias: number;
  productividad: number;
  intervaloPromedio: number;
}

interface TrazabilidadVacaProps {
  vacaId: string;
  onVolver: () => void;
}

const TrazabilidadVaca: React.FC<TrazabilidadVacaProps> = ({ vacaId, onVolver }) => {
  const [vaca, setVaca] = useState<Vaca | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  useEffect(() => {
    cargarTrazabilidad();
  }, [vacaId]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarTrazabilidad = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/gestacion/trazabilidad/${vacaId}`);
      if (!response.ok) {
        throw new Error('Error al cargar la trazabilidad');
      }
      const data = await response.json();
      setVaca(data.vaca);
      setEstadisticas(data.estadisticas);
      setEventos(data.eventos);
      setResumen(data.resumen);
    } catch (error) {
      console.error('Error al cargar trazabilidad:', error);
      setError('Error al cargar la trazabilidad de la vaca');
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      servicio: 'Servicio',
      confirmacion: 'Confirmación',
      fecha_probable_parto: 'Fecha Probable',
      parto_real: 'Parto Real',
      seguimiento: 'Seguimiento'
    };
    return tipos[tipo] || tipo;
  };

  const eventosFiltrados = filtroTipo 
    ? eventos.filter(evento => evento.tipo === filtroTipo)
    : eventos;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const handleVerDetalles = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setMostrarDetalles(true);
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setEventoSeleccionado(null);
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {error}
      </div>
    );
  }

  if (!vaca) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        No se encontró información de la vaca
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Trazabilidad de Gestación
            </h2>
            <div className="mt-2">
              <span className="text-2xl font-semibold text-gray-900">
                {vaca.numeroIdentificacion}
              </span>
              {vaca.nombre && (
                <span className="text-xl text-gray-600 ml-2">({vaca.nombre})</span>
              )}
            </div>
          </div>
          <button
            onClick={onVolver}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            ← Volver
          </button>
        </div>

        {/* Información básica de la vaca */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-600">Raza</div>
            <div className="text-lg font-semibold text-gray-900">{vaca.raza}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Edad</div>
            <div className="text-lg font-semibold text-gray-900">{resumen?.edadVaca || 0} años</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Total Crías</div>
            <div className="text-lg font-semibold text-gray-900">{resumen?.totalCrias || 0}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Productividad</div>
            <div className="text-lg font-semibold text-gray-900">{resumen?.productividad.toFixed(1) || 0}%</div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gestaciones</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalGestaciones}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partos Exitosos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.partosExitosos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Abortos</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.abortos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Intervalo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{resumen?.intervaloPromedio || 0} días</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroTipo('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filtroTipo === '' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          {['servicio', 'confirmacion', 'fecha_probable_parto', 'parto_real', 'seguimiento'].map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filtroTipo === tipo 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getTipoLabel(tipo)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline de Eventos */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Historial Completo ({eventosFiltrados.length} eventos)
        </h3>
        
        {eventosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay eventos registrados para esta vaca
          </div>
        ) : (
          <div className="space-y-4">
            {eventosFiltrados.map((evento, index) => (
              <div key={index} className="relative">
                {/* Línea conectora */}
                {index < eventosFiltrados.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                )}
                
                <div className={`flex items-start p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow duration-200 ${getColorClasses(evento.color)}`}
                     onClick={() => handleVerDetalles(evento)}>
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl">
                      {evento.icono}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {evento.titulo}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {evento.descripcion}
                        </p>
                        <button 
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerDetalles(evento);
                          }}
                        >
                          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Ver detalles completos
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(evento.fecha).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTipoLabel(evento.tipo)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles del evento */}
      {mostrarDetalles && eventoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {eventoSeleccionado.icono}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {eventoSeleccionado.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getTipoLabel(eventoSeleccionado.tipo)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarDetalles}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">📅 Fecha del Evento</h4>
                  <p className="text-gray-700">
                    {new Date(eventoSeleccionado.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">📝 Descripción</h4>
                  <p className="text-gray-700">{eventoSeleccionado.descripcion}</p>
                </div>

                {eventoSeleccionado.observaciones && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Observaciones
                    </h4>
                    <p className="text-blue-800">{eventoSeleccionado.observaciones}</p>
                  </div>
                )}

                {eventoSeleccionado.complicaciones && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Complicaciones
                    </h4>
                    <p className="text-red-800">{eventoSeleccionado.complicaciones}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Tipo de Evento
                  </h4>
                  <p className="text-gray-700">{getTipoLabel(eventoSeleccionado.tipo)}</p>
                </div>

                {/* Información adicional según el tipo de evento */}
                {eventoSeleccionado.tipo === 'servicio' && eventoSeleccionado.detallesAdicionales && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🐂 Información del Servicio</h4>
                    <div className="space-y-2 text-blue-800">
                      {eventoSeleccionado.detallesAdicionales.toroPadre && (
                        <p><strong>Toro Padre:</strong> {eventoSeleccionado.detallesAdicionales.toroPadre}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.semenToro && (
                        <p><strong>Semen Toro:</strong> {eventoSeleccionado.detallesAdicionales.semenToro}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.diasGestacionConfirmados && (
                        <p><strong>Días de Gestación Confirmados:</strong> {eventoSeleccionado.detallesAdicionales.diasGestacionConfirmados} días</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.pesoInicial && (
                        <p><strong>Peso Inicial:</strong> {eventoSeleccionado.detallesAdicionales.pesoInicial} kg</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.fechaRegistro && (
                        <p><strong>Fecha de Registro:</strong> {new Date(eventoSeleccionado.detallesAdicionales.fechaRegistro).toLocaleDateString()}</p>
                      )}
                    </div>
                    
                    {/* Cuidados especiales */}
                    {(eventoSeleccionado.detallesAdicionales.dietaEspecial || 
                      eventoSeleccionado.detallesAdicionales.medicamentos?.length > 0 || 
                      eventoSeleccionado.detallesAdicionales.restricciones?.length > 0 ||
                      eventoSeleccionado.detallesAdicionales.ejercicioRecomendado) && (
                      <div className="mt-4 border-t border-blue-200 pt-3">
                        <h5 className="font-semibold text-blue-900 mb-2">🩺 Cuidados Especiales</h5>
                        {eventoSeleccionado.detallesAdicionales.dietaEspecial && (
                          <p><strong>Dieta Especial:</strong> {eventoSeleccionado.detallesAdicionales.dietaEspecial}</p>
                        )}
                        {eventoSeleccionado.detallesAdicionales.medicamentos?.length > 0 && (
                          <div>
                            <p><strong>Medicamentos:</strong></p>
                            <ul className="ml-4 list-disc">
                              {eventoSeleccionado.detallesAdicionales.medicamentos.map((med: string, index: number) => (
                                <li key={index}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {eventoSeleccionado.detallesAdicionales.restricciones?.length > 0 && (
                          <div>
                            <p><strong>Restricciones:</strong></p>
                            <ul className="ml-4 list-disc">
                              {eventoSeleccionado.detallesAdicionales.restricciones.map((rest: string, index: number) => (
                                <li key={index}>{rest}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {eventoSeleccionado.detallesAdicionales.ejercicioRecomendado && (
                          <p><strong>Ejercicio Recomendado:</strong> {eventoSeleccionado.detallesAdicionales.ejercicioRecomendado}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {eventoSeleccionado.tipo === 'confirmacion' && eventoSeleccionado.detallesAdicionales && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Confirmación de Gestación</h4>
                    <div className="space-y-2 text-green-800">
                      {eventoSeleccionado.detallesAdicionales.metodoConfirmacion && (
                        <p><strong>Método:</strong> {eventoSeleccionado.detallesAdicionales.metodoConfirmacion}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.confirmadoPor && (
                        <p><strong>Confirmado por:</strong> {eventoSeleccionado.detallesAdicionales.confirmadoPor}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.diasGestacionConfirmados && (
                        <p><strong>Días de Gestación:</strong> {eventoSeleccionado.detallesAdicionales.diasGestacionConfirmados} días</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.pesoActual && (
                        <p><strong>Peso Actual:</strong> {eventoSeleccionado.detallesAdicionales.pesoActual} kg</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.gananciaPeso && (
                        <p><strong>Ganancia de Peso:</strong> {eventoSeleccionado.detallesAdicionales.gananciaPeso} kg</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.trimestreActual && (
                        <p><strong>Trimestre Actual:</strong> {eventoSeleccionado.detallesAdicionales.trimestreActual}/3</p>
                      )}
                    </div>
                  </div>
                )}

                {eventoSeleccionado.tipo === 'parto_real' && eventoSeleccionado.detallesAdicionales && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">👶 Información del Parto</h4>
                    <div className="space-y-2 text-purple-800">
                      {eventoSeleccionado.detallesAdicionales.tipoParto && (
                        <p><strong>Tipo de Parto:</strong> {eventoSeleccionado.detallesAdicionales.tipoParto}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.asistenciaVeterinaria !== undefined && (
                        <p><strong>Asistencia Veterinaria:</strong> {eventoSeleccionado.detallesAdicionales.asistenciaVeterinaria ? 'Sí' : 'No'}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.pesoCria && (
                        <p><strong>Peso de la Cría:</strong> {eventoSeleccionado.detallesAdicionales.pesoCria} kg</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.sexoCria && (
                        <p><strong>Sexo de la Cría:</strong> {eventoSeleccionado.detallesAdicionales.sexoCria}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.estadoCria && (
                        <p><strong>Estado de la Cría:</strong> {eventoSeleccionado.detallesAdicionales.estadoCria}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.observacionesParto && (
                        <p><strong>Observaciones del Parto:</strong> {eventoSeleccionado.detallesAdicionales.observacionesParto}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.fechaActualizacion && (
                        <p><strong>Última Actualización:</strong> {new Date(eventoSeleccionado.detallesAdicionales.fechaActualizacion).toLocaleDateString()}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.crias && eventoSeleccionado.detallesAdicionales.crias.length > 0 && (
                        <div>
                          <p><strong>Crías Nacidas:</strong></p>
                          <ul className="ml-4 list-disc">
                            {eventoSeleccionado.detallesAdicionales.crias.map((cria: any, index: number) => (
                              <li key={index}>
                                {cria.numeroIdentificacion} - {cria.sexo} - {cria.pesoNacimiento}kg
                                {cria.observaciones && ` (${cria.observaciones})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {eventoSeleccionado.tipo === 'seguimiento' && eventoSeleccionado.detallesAdicionales && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Detalles del Seguimiento
                    </h4>
                    <div className="space-y-2 text-gray-700">
                      {eventoSeleccionado.detallesAdicionales.peso && (
                        <p><strong>Peso:</strong> {eventoSeleccionado.detallesAdicionales.peso} kg</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.condicionCorporal && (
                        <p><strong>Condición Corporal:</strong> {eventoSeleccionado.detallesAdicionales.condicionCorporal}/5</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.veterinario && (
                        <p><strong>Veterinario:</strong> {eventoSeleccionado.detallesAdicionales.veterinario}</p>
                      )}
                      {eventoSeleccionado.detallesAdicionales.examenes && eventoSeleccionado.detallesAdicionales.examenes.length > 0 && (
                        <div>
                          <p><strong>Exámenes Realizados:</strong></p>
                          <ul className="ml-4 list-disc">
                            {eventoSeleccionado.detallesAdicionales.examenes.map((examen: string, index: number) => (
                              <li key={index}>{examen}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={cerrarDetalles}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrazabilidadVaca;
