'use client';

import React, { useState } from 'react';

interface Lote {
  _id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  tipoLote: string;
  capacidadMaxima?: number;
  ubicacionPrincipal?: string;
  activo: boolean;
  numeroVacas?: number;
}

interface ListaLotesProps {
  lotes: Lote[];
  onEditar: (lote: Lote) => void;
  onEliminar: (id: string) => void;
  onVerDetalle: (lote: Lote) => void;
  isLoading?: boolean;
}

const ListaLotes: React.FC<ListaLotesProps> = ({
  lotes,
  onEditar,
  onEliminar,
  onVerDetalle,
  isLoading = false
}) => {
  const [filtro, setFiltro] = useState('');

  const lotesFiltrados = lotes.filter(lote =>
    lote.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (lote.descripcion && lote.descripcion.toLowerCase().includes(filtro.toLowerCase()))
  );

  const getTipoLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      produccion: 'Producción',
      gestacion: 'Gestación',
      novillas: 'Novillas',
      secas: 'Secas',
      enfermeria: 'Enfermería',
      venta: 'Para Venta',
      otro: 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    const iconos: { [key: string]: string } = {
      produccion: '🥛',
      gestacion: '🤰',
      novillas: '🐮',
      secas: '🛑',
      enfermeria: '🏥',
      venta: '💰',
      otro: '📋'
    };
    return iconos[tipo] || '📋';
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Lotes Configurados</h2>
            <p className="text-sm text-gray-600 mt-1">
              {lotesFiltrados.length} lote(s) encontrado(s)
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar lote..."
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
      </div>

      {/* Grid de Lotes */}
      <div className="p-6">
        {lotesFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {filtro ? 'No se encontraron lotes' : 'No hay lotes configurados. ¡Crea el primero!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotesFiltrados.map((lote) => (
              <div
                key={lote._id}
                className="border-2 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                style={{ borderColor: lote.color }}
              >
                {/* Header con color */}
                <div
                  className="p-4 text-white"
                  style={{ backgroundColor: lote.color }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold flex items-center">
                        <span className="text-2xl mr-2">{getTipoIcon(lote.tipoLote)}</span>
                        {lote.nombre}
                      </h3>
                      <p className="text-sm opacity-90 mt-1">
                        {getTipoLabel(lote.tipoLote)}
                      </p>
                    </div>
                    {!lote.activo && (
                      <span className="px-2 py-1 bg-white bg-opacity-30 rounded text-xs font-semibold">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 bg-white">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {lote.numeroVacas || 0}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Vacas</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {lote.capacidadMaxima || '∞'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Capacidad</p>
                    </div>
                  </div>

                  {/* Descripción */}
                  {lote.descripcion && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {lote.descripcion}
                    </p>
                  )}

                  {/* Ubicación */}
                  {lote.ubicacionPrincipal && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {lote.ubicacionPrincipal}
                    </div>
                  )}

                  {/* Alertas */}
                  {lote.capacidadMaxima && lote.numeroVacas && lote.numeroVacas >= lote.capacidadMaxima && (
                    <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-800 font-medium">
                        ⚠️ Capacidad máxima alcanzada
                      </p>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onVerDetalle(lote)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Vacas
                    </button>
                    <button
                      onClick={() => onEditar(lote)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el lote ${lote.nombre}?`)) {
                          onEliminar(lote._id);
                        }
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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

export default ListaLotes;

