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
                
                <div className={`flex items-start p-4 rounded-lg border-l-4 ${getColorClasses(evento.color)}`}>
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
    </div>
  );
};

export default TrazabilidadVaca;
