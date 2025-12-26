'use client';

import React, { useState } from 'react';

interface ProduccionLechera {
  _id: string;
  vacaId: string;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  fecha: string;
  ordenoManana?: number;
  ordenoTarde?: number;
  ordenoNoche?: number;
  totalDia: number;
  grasa?: number;
  proteina?: number;
  celulasSomaticas?: number;
  observaciones?: string;
  anomalias?: string;
}

interface ListaProduccionLecheraProps {
  producciones: ProduccionLechera[];
  onEditar: (produccion: ProduccionLechera) => void;
  onEliminar: (id: string) => void;
  isLoading?: boolean;
}

const ListaProduccionLechera: React.FC<ListaProduccionLecheraProps> = ({
  producciones,
  onEditar,
  onEliminar,
  isLoading = false
}) => {
  const [filtro, setFiltro] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const produccionesFiltradas = producciones.filter(prod => {
    const matchTexto = prod.numeroIdentificacionVaca.toLowerCase().includes(filtro.toLowerCase()) ||
      (prod.nombreVaca && prod.nombreVaca.toLowerCase().includes(filtro.toLowerCase()));
    
    const matchFecha = !filtroFecha || prod.fecha.startsWith(filtroFecha);
    
    return matchTexto && matchFecha;
  });

  // Calcular estadísticas
  const totalLitros = produccionesFiltradas.reduce((sum, p) => sum + p.totalDia, 0);
  const promedio = produccionesFiltradas.length > 0 ? totalLitros / produccionesFiltradas.length : 0;
  const maxProduccion = produccionesFiltradas.length > 0 
    ? Math.max(...produccionesFiltradas.map(p => p.totalDia)) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header con estadísticas */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Registros de Producción</h2>
            <p className="text-sm text-gray-600 mt-1">
              {produccionesFiltradas.length} registro(s) encontrado(s)
            </p>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{totalLitros.toFixed(1)} L</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Promedio</p>
              <p className="text-2xl font-bold text-green-600">{promedio.toFixed(1)} L</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Máximo</p>
              <p className="text-2xl font-bold text-purple-600">{maxProduccion.toFixed(1)} L</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por vaca..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vaca
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mañana
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarde
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Noche
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calidad
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
                  {filtro || filtroFecha ? 'No se encontraron registros con esos criterios' : 'No hay registros de producción'}
                </td>
              </tr>
            ) : (
              produccionesFiltradas.map((prod) => (
                <tr key={prod._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(prod.fecha).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {prod.numeroIdentificacionVaca}
                    </div>
                    {prod.nombreVaca && (
                      <div className="text-sm text-gray-500">{prod.nombreVaca}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {prod.ordenoManana ? `${prod.ordenoManana.toFixed(1)} L` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {prod.ordenoTarde ? `${prod.ordenoTarde.toFixed(1)} L` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {prod.ordenoNoche ? `${prod.ordenoNoche.toFixed(1)} L` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {prod.totalDia.toFixed(1)} L
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-xs space-y-1">
                      {prod.grasa && (
                        <div className="text-gray-600">
                          G: {prod.grasa.toFixed(1)}%
                        </div>
                      )}
                      {prod.proteina && (
                        <div className="text-gray-600">
                          P: {prod.proteina.toFixed(1)}%
                        </div>
                      )}
                      {prod.celulasSomaticas && (
                        <div className={`font-medium ${
                          prod.celulasSomaticas > 400000 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          CS: {(prod.celulasSomaticas / 1000).toFixed(0)}k
                        </div>
                      )}
                      {!prod.grasa && !prod.proteina && !prod.celulasSomaticas && '-'}
                    </div>
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
                    {(prod.observaciones || prod.anomalias) && (
                      <div className="mt-2">
                        <details className="text-xs text-left">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            Ver notas
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
                            {prod.observaciones && (
                              <p className="mb-1"><strong>Obs:</strong> {prod.observaciones}</p>
                            )}
                            {prod.anomalias && (
                              <p className="text-red-600"><strong>Anomalías:</strong> {prod.anomalias}</p>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen por vaca */}
      {produccionesFiltradas.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen por Vaca</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const resumenPorVaca = new Map<string, {
                numeroIdentificacion: string;
                nombre?: string;
                total: number;
                registros: number;
                promedio: number;
              }>();

              produccionesFiltradas.forEach(p => {
                const key = p.numeroIdentificacionVaca;
                if (!resumenPorVaca.has(key)) {
                  resumenPorVaca.set(key, {
                    numeroIdentificacion: p.numeroIdentificacionVaca,
                    nombre: p.nombreVaca,
                    total: 0,
                    registros: 0,
                    promedio: 0
                  });
                }
                const vaca = resumenPorVaca.get(key)!;
                vaca.total += p.totalDia;
                vaca.registros += 1;
                vaca.promedio = vaca.total / vaca.registros;
              });

              return Array.from(resumenPorVaca.values())
                .sort((a, b) => b.total - a.total)
                .map((vaca, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{vaca.numeroIdentificacion}</p>
                        {vaca.nombre && <p className="text-sm text-gray-500">{vaca.nombre}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{vaca.total.toFixed(1)} L</p>
                        <p className="text-xs text-gray-500">{vaca.registros} día(s)</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Promedio:</span>
                        <span className="font-semibold text-gray-800">{vaca.promedio.toFixed(1)} L/día</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((vaca.total / totalLitros) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaProduccionLechera;

