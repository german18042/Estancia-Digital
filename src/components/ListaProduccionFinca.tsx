'use client';

import React, { useState } from 'react';

interface ProduccionFinca {
  _id: string;
  fecha: string;
  totalLitros: number;
  numeroVacasOrdenadas?: number;
  grasaPromedio?: number;
  proteinaPromedio?: number;
  costoAlimentacion?: number;
  costoManoObra?: number;
  otrosCostos?: number;
  observaciones?: string;
  clima?: string;
}

interface ListaProduccionFincaProps {
  producciones: ProduccionFinca[];
  onEditar: (produccion: ProduccionFinca) => void;
  onEliminar: (id: string) => void;
  isLoading?: boolean;
}

const ListaProduccionFinca: React.FC<ListaProduccionFincaProps> = ({
  producciones,
  onEditar,
  onEliminar,
  isLoading = false
}) => {
  const [filtroFecha, setFiltroFecha] = useState('');

  const produccionesFiltradas = producciones.filter(prod => {
    return !filtroFecha || prod.fecha.startsWith(filtroFecha);
  });

  // Calcular estadísticas
  const totalLitros = produccionesFiltradas.reduce((sum, p) => sum + p.totalLitros, 0);
  const totalCostos = produccionesFiltradas.reduce((sum, p) => 
    sum + (p.costoAlimentacion || 0) + (p.costoManoObra || 0) + (p.otrosCostos || 0), 0
  );
  const promedio = produccionesFiltradas.length > 0 ? totalLitros / produccionesFiltradas.length : 0;
  const maxProduccion = produccionesFiltradas.length > 0 
    ? Math.max(...produccionesFiltradas.map(p => p.totalLitros)) 
    : 0;

  const getClimaIcon = (clima?: string) => {
    const iconos: { [key: string]: string } = {
      soleado: '☀️',
      nublado: '☁️',
      lluvioso: '🌧️',
      caluroso: '🔥',
      frio: '❄️'
    };
    return clima ? iconos[clima] || '🌤️' : '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header con estadísticas */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Producción Total de la Finca</h2>
            <p className="text-sm text-gray-600 mt-1">
              {produccionesFiltradas.length} día(s) registrado(s)
            </p>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-green-600">{totalLitros.toFixed(1)} L</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Promedio</p>
              <p className="text-xl font-bold text-blue-600">{promedio.toFixed(1)} L</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Máximo</p>
              <p className="text-xl font-bold text-purple-600">{maxProduccion.toFixed(1)} L</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Costos</p>
              <p className="text-xl font-bold text-orange-600">${totalCostos.toFixed(0)}</p>
            </div>
          </div>
        </div>

        {/* Filtro */}
        <div>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            placeholder="Filtrar por fecha..."
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Litros
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vacas Ordeñadas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Promedio/Vaca
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calidad
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clima
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produccionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  {filtroFecha ? 'No hay registros para esta fecha' : 'No hay registros de producción de finca'}
                </td>
              </tr>
            ) : (
              produccionesFiltradas.map((prod) => {
                const costoTotal = (prod.costoAlimentacion || 0) + (prod.costoManoObra || 0) + (prod.otrosCostos || 0);
                const promedioPorVaca = prod.numeroVacasOrdenadas 
                  ? (prod.totalLitros / prod.numeroVacasOrdenadas).toFixed(1)
                  : null;

                return (
                  <tr key={prod._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(prod.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'short',
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-xl font-bold text-green-600">
                        {prod.totalLitros.toFixed(1)} L
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {prod.numeroVacasOrdenadas || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-blue-600">
                        {promedioPorVaca ? `${promedioPorVaca} L` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-xs space-y-1">
                        {prod.grasaPromedio && (
                          <div className="text-gray-600">
                            G: {prod.grasaPromedio.toFixed(1)}%
                          </div>
                        )}
                        {prod.proteinaPromedio && (
                          <div className="text-gray-600">
                            P: {prod.proteinaPromedio.toFixed(1)}%
                          </div>
                        )}
                        {!prod.grasaPromedio && !prod.proteinaPromedio && '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-orange-600">
                        {costoTotal > 0 ? `$${costoTotal.toFixed(2)}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-xl">{getClimaIcon(prod.clima)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onEditar(prod)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este registro?')) {
                              onEliminar(prod._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaProduccionFinca;

