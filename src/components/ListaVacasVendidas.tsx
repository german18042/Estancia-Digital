'use client';

import React, { useState, useEffect } from 'react';

interface VacaVendida {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string;
  peso: number;
  // Datos de venta
  fechaSalida?: string;
  comprador?: string;
  precioVenta?: number;
  metodoPago?: string;
  observacionesSalida?: string;
}

const ListaVacasVendidas: React.FC = () => {
  const [vacas, setVacas] = useState<VacaVendida[]>([]);
  const [filtro, setFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarVacasVendidas();
  }, []);

  const cargarVacasVendidas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/vacas?activa=false');
      
      if (!response.ok) {
        throw new Error('Error al cargar vacas vendidas');
      }

      const data = await response.json();
      // Filtrar solo las vendidas
      const vendidas = (data.vacas || []).filter((vaca: VacaVendida & { motivoInactivacion?: string }) => 
        vaca.motivoInactivacion === 'vendido'
      );
      setVacas(vendidas);
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
      (vaca.comprador && vaca.comprador.toLowerCase().includes(filtro.toLowerCase())) ||
      vaca.raza.toLowerCase().includes(filtro.toLowerCase());
  });

  const totalVentas = vacas.reduce((total, vaca) => total + (vaca.precioVenta || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                <svg className="w-6 h-6 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Vacas Vendidas
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Historial completo de ventas de ganado con información detallada
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600">Total Vendidas</div>
              <div className="text-2xl font-bold text-green-600">{vacas.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600">Ingresos Totales</div>
              <div className="text-2xl font-bold text-green-600">${totalVentas.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600">Precio Promedio</div>
              <div className="text-2xl font-bold text-green-600">
                ${vacas.length > 0 ? (totalVentas / vacas.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por número, nombre, comprador o raza..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>
            </div>
            <div className="mt-2 text-sm text-black">
              Mostrando {vacasFiltradas.length} de {vacas.length} animales vendidos
            </div>
          </div>

        {/* Lista */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-black">Cargando vacas vendidas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : vacasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-black text-lg">
              {filtro ? 'No se encontraron vacas con ese criterio' : 'No hay vacas vendidas registradas'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vacasFiltradas.map((vaca) => (
              <div key={vaca._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
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
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Vendido
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-black font-medium">Raza:</span>
                          <span className="ml-2 font-medium text-black">{vaca.raza}</span>
                        </div>
                        <div>
                          <span className="text-black font-medium">Sexo:</span>
                          <span className="ml-2 font-medium text-black">{vaca.sexo === 'hembra' ? 'Hembra' : 'Macho'}</span>
                        </div>
                        <div>
                          <span className="text-black font-medium">Peso:</span>
                          <span className="ml-2 font-medium text-black">{vaca.peso} kg</span>
                        </div>
                        {vaca.fechaSalida && (
                          <div>
                            <span className="text-black font-medium">Fecha de Venta:</span>
                            <span className="ml-2 font-medium text-black">
                              {new Date(vaca.fechaSalida).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detalles de venta */}
                    <div className="lg:w-1/3">
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Datos de Venta
                        </h4>
                        <div className="space-y-2">
                          {vaca.comprador && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-black font-medium">Comprador:</span>
                              <span className="font-medium text-black">{vaca.comprador}</span>
                            </div>
                          )}
                          {vaca.precioVenta && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-black font-medium">Precio:</span>
                              <span className="font-bold text-green-700 text-lg">
                                ${vaca.precioVenta.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {vaca.metodoPago && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-black font-medium">Método:</span>
                              <span className="font-medium text-black capitalize">
                                {vaca.metodoPago}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  {vaca.observacionesSalida && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <span className="text-sm font-semibold text-blue-900">Observaciones:</span>
                        <p className="mt-1 text-sm text-blue-800">{vaca.observacionesSalida}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaVacasVendidas;

