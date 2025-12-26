'use client';

import React, { useState } from 'react';

interface RegistroSanitario {
  _id: string;
  vacaId: string;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  tipo: string;
  fecha: string;
  nombre: string;
  producto?: string;
  dosis?: string;
  veterinario?: string;
  proximaFecha?: string;
  costo?: number;
  completado: boolean;
  observaciones?: string;
}

interface ListaRegistrosSanitariosProps {
  registros: RegistroSanitario[];
  onEditar: (registro: RegistroSanitario) => void;
  onEliminar: (id: string) => void;
  isLoading?: boolean;
}

const ListaRegistrosSanitarios: React.FC<ListaRegistrosSanitariosProps> = ({
  registros,
  onEditar,
  onEliminar,
  isLoading = false
}) => {
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const registrosFiltrados = registros.filter(reg => {
    const matchTexto = reg.numeroIdentificacionVaca.toLowerCase().includes(filtro.toLowerCase()) ||
      (reg.nombreVaca && reg.nombreVaca.toLowerCase().includes(filtro.toLowerCase())) ||
      reg.nombre.toLowerCase().includes(filtro.toLowerCase());
    
    const matchTipo = !filtroTipo || reg.tipo === filtroTipo;
    
    return matchTexto && matchTipo;
  });

  const getTipoLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      vacuna: 'Vacuna',
      desparasitacion: 'Desparasitación',
      tratamiento: 'Tratamiento',
      revision: 'Revisión',
      cirugia: 'Cirugía',
      otro: 'Otro'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colores: { [key: string]: string } = {
      vacuna: 'bg-blue-100 text-blue-800',
      desparasitacion: 'bg-green-100 text-green-800',
      tratamiento: 'bg-purple-100 text-purple-800',
      revision: 'bg-yellow-100 text-yellow-800',
      cirugia: 'bg-red-100 text-red-800',
      otro: 'bg-gray-100 text-gray-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const calcularDiasHasta = (fecha: string) => {
    const hoy = new Date();
    const futura = new Date(fecha);
    return Math.ceil((futura.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
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
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial Sanitario</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
          >
            <option value="">Todos los tipos</option>
            <option value="vacuna">Vacunas</option>
            <option value="desparasitacion">Desparasitaciones</option>
            <option value="tratamiento">Tratamientos</option>
            <option value="revision">Revisiones</option>
            <option value="cirugia">Cirugías</option>
            <option value="otro">Otros</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedimiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próxima</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Costo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {registrosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No hay registros sanitarios
                </td>
              </tr>
            ) : (
              registrosFiltrados.map((reg) => (
                <tr key={reg._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reg.fecha).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reg.numeroIdentificacionVaca}
                    </div>
                    {reg.nombreVaca && (
                      <div className="text-sm text-gray-500">{reg.nombreVaca}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(reg.tipo)}`}>
                      {getTipoLabel(reg.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{reg.nombre}</div>
                    {reg.producto && (
                      <div className="text-xs text-gray-500">{reg.producto}</div>
                    )}
                    {reg.dosis && (
                      <div className="text-xs text-gray-500">Dosis: {reg.dosis}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reg.proximaFecha ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(reg.proximaFecha).toLocaleDateString()}
                        </div>
                        {(() => {
                          const dias = calcularDiasHasta(reg.proximaFecha);
                          return (
                            <div className={`text-xs font-medium ${
                              dias < 0 ? 'text-red-600' :
                              dias <= 7 ? 'text-yellow-600' :
                              'text-gray-500'
                            }`}>
                              {dias < 0 ? 'Vencido' : dias === 0 ? 'Hoy' : `En ${dias} días`}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {reg.costo ? (
                      <div className="text-sm font-medium text-gray-900">
                        ${reg.costo.toFixed(2)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEditar(reg)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar este registro?')) {
                            onEliminar(reg._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaRegistrosSanitarios;

