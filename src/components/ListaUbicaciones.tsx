'use client';

import React, { useState } from 'react';

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

interface ListaUbicacionesProps {
  ubicaciones: Ubicacion[];
  onEditar: (ubicacion: Ubicacion) => void;
  onEliminar: (id: string) => void;
  isLoading?: boolean;
}

const ListaUbicaciones: React.FC<ListaUbicacionesProps> = ({
  ubicaciones,
  onEditar,
  onEliminar,
  isLoading = false
}) => {
  const [filtro, setFiltro] = useState('');

  const ubicacionesFiltradas = ubicaciones.filter(ubicacion =>
    ubicacion.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    ubicacion.tipo.toLowerCase().includes(filtro.toLowerCase())
  );

  const getTipoLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'potrero': 'Potrero',
      'corral': 'Corral',
      'establo': 'Establo',
      'area_especial': 'Área Especial',
      'otro': 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'activa': 'bg-green-100 text-green-800',
      'mantenimiento': 'bg-yellow-100 text-yellow-800',
      'inactiva': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoLabel = (estado: string) => {
    const estados: { [key: string]: string } = {
      'activa': 'Activa',
      'mantenimiento': 'Mantenimiento',
      'inactiva': 'Inactiva'
    };
    return estados[estado] || estado;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Ubicaciones</h2>
          <span className="text-sm text-gray-600">
            {ubicacionesFiltradas.length} de {ubicaciones.length} ubicaciones
          </span>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Vista de escritorio */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Área
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ubicacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {filtro ? 'No se encontraron ubicaciones' : 'No hay ubicaciones registradas'}
                </td>
              </tr>
            ) : (
              ubicacionesFiltradas.map((ubicacion) => (
                <tr key={ubicacion._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ubicacion.nombre}
                      </div>
                      {ubicacion.caracteristicas && ubicacion.caracteristicas.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {ubicacion.caracteristicas.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getTipoLabel(ubicacion.tipo)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {ubicacion.capacidad ? `${ubicacion.capacidad} animales` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {ubicacion.area ? `${ubicacion.area} ha/m²` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(ubicacion.estado)}`}>
                      {getEstadoLabel(ubicacion.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditar(ubicacion)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onEliminar(ubicacion._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista móvil */}
      <div className="md:hidden p-4 space-y-4">
        {ubicacionesFiltradas.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            {filtro ? 'No se encontraron ubicaciones' : 'No hay ubicaciones registradas'}
          </div>
        ) : (
          ubicacionesFiltradas.map((ubicacion) => (
            <div key={ubicacion._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-lg font-bold text-gray-900">{ubicacion.nombre}</div>
                  <div className="text-sm text-gray-600">{getTipoLabel(ubicacion.tipo)}</div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(ubicacion.estado)}`}>
                  {getEstadoLabel(ubicacion.estado)}
                </span>
              </div>
              
              <div className="space-y-1 mb-3">
                {ubicacion.capacidad && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Capacidad:</span> {ubicacion.capacidad} animales
                  </div>
                )}
                {ubicacion.area && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Área:</span> {ubicacion.area} ha/m²
                  </div>
                )}
                {ubicacion.caracteristicas && ubicacion.caracteristicas.length > 0 && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Características:</span> {ubicacion.caracteristicas.join(', ')}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
                <button
                  onClick={() => onEditar(ubicacion)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => onEliminar(ubicacion._id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListaUbicaciones;

