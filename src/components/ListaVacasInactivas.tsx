'use client';

import React, { useState, useEffect } from 'react';

interface VacaInactiva {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string;
  estadoReproductivo: string;
  // Datos de salida
  motivoInactivacion?: 'vendido' | 'fallecido';
  fechaSalida?: string;
  // Venta
  comprador?: string;
  precioVenta?: number;
  metodoPago?: string;
  // Muerte
  causaMuerte?: string;
  diagnosticoMuerte?: string;
  observacionesSalida?: string;
}

const ListaVacasInactivas: React.FC = () => {
  const [vacas, setVacas] = useState<VacaInactiva[]>([]);
  const [filtro, setFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarVacasInactivas();
  }, []);

  const cargarVacasInactivas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vacas?activa=false');
      
      if (!response.ok) {
        throw new Error('Error al cargar vacas fallecidas');
      }

      const data = await response.json();
      // Filtrar solo las fallecidas
      const fallecidas = (data.vacas || []).filter((vaca: VacaInactiva) => 
        vaca.motivoInactivacion === 'fallecido'
      );
      setVacas(fallecidas);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las vacas');
    } finally {
      setIsLoading(false);
    }
  };

  const vacasFiltradas = vacas.filter(vaca => {
    return filtro === '' || 
      vaca.numeroIdentificacion.toLowerCase().includes(filtro.toLowerCase()) ||
      (vaca.nombre && vaca.nombre.toLowerCase().includes(filtro.toLowerCase())) ||
      vaca.raza.toLowerCase().includes(filtro.toLowerCase());
  });

  const getTipoLabel = (tipo?: string) => {
    if (tipo === 'vendido') return 'Vendido';
    if (tipo === 'fallecido') return 'Fallecido';
    return '❓ No especificado';
  };

  const getTipoColor = (tipo?: string) => {
    if (tipo === 'vendido') return 'bg-green-100 text-green-800';
    if (tipo === 'fallecido') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                <svg className="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Vacas Fallecidas
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Registro histórico de animales fallecidos con información detallada
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por número, nombre o raza..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              />
            </div>
            <div className="mt-2 text-sm text-black">
              Mostrando {vacasFiltradas.length} de {vacas.length} animales fallecidos
            </div>
          </div>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-black">Cargando vacas inactivas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : vacasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-black text-lg">
              {filtro ? 'No se encontraron vacas con ese criterio' : 'No hay vacas fallecidas registradas'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vacasFiltradas.map((vaca) => (
              <div key={vaca._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                  {/* Información básica */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {vaca.numeroIdentificacion}
                      </h3>
                      {vaca.nombre && (
                        <span className="text-lg text-gray-600">({vaca.nombre})</span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(vaca.motivoInactivacion)}`}>
                        {getTipoLabel(vaca.motivoInactivacion)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-black font-medium">Raza:</span>
                        <span className="ml-2 font-medium text-black">{vaca.raza}</span>
                      </div>
                      <div>
                        <span className="text-black font-medium">Sexo:</span>
                        <span className="ml-2 font-medium text-black">{vaca.sexo === 'hembra' ? 'Hembra' : 'Macho'}</span>
                      </div>
                      {vaca.fechaSalida && (
                        <div>
                          <span className="text-black font-medium">Fecha de Salida:</span>
                          <span className="ml-2 font-medium text-black">
                            {new Date(vaca.fechaSalida).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalles según tipo */}
                  <div className="lg:w-1/3">
                    {vaca.motivoInactivacion === 'vendido' && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Datos de Venta
                        </h4>
                        <div className="space-y-1 text-sm">
                          {vaca.comprador && (
                            <div>
                              <span className="text-black font-medium">Comprador:</span>
                              <span className="ml-2 font-medium text-black">{vaca.comprador}</span>
                            </div>
                          )}
                          {vaca.precioVenta && (
                            <div>
                              <span className="text-black font-medium">Precio:</span>
                              <span className="ml-2 font-medium text-black">${vaca.precioVenta.toLocaleString()}</span>
                            </div>
                          )}
                          {vaca.metodoPago && (
                            <div>
                              <span className="text-black font-medium">Método:</span>
                              <span className="ml-2 font-medium text-black capitalize">{vaca.metodoPago}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {vaca.motivoInactivacion === 'fallecido' && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Datos de Fallecimiento
                        </h4>
                        <div className="space-y-1 text-sm">
                          {vaca.causaMuerte && (
                            <div>
                              <span className="text-black font-medium">Causa:</span>
                              <span className="ml-2 font-medium text-black capitalize">{vaca.causaMuerte}</span>
                            </div>
                          )}
                          {vaca.diagnosticoMuerte && (
                            <div className="mt-2">
                              <span className="text-black font-medium">Diagnóstico:</span>
                              <p className="mt-1 text-black">{vaca.diagnosticoMuerte}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observaciones */}
                {vaca.observacionesSalida && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Observaciones:</span>
                    <p className="mt-1 text-sm text-gray-700">{vaca.observacionesSalida}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaVacasInactivas;

