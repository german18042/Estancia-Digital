'use client';

import React, { useState, useEffect } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  fechaNacimiento: string;
  sexo: 'macho' | 'hembra';
  raza: string;
  colorPelaje: string;
  peso: number;
  alturaCruz: number;
  estadoReproductivo: string;
  ubicacionActual: string;
  lote?: string;
  condicionCorporal: number;
  produccionLecheraDiaria?: number;
  activa: boolean;
}

interface ListaVacasProps {
  vacas: Vaca[];
  onEditar: (vaca: Vaca) => void;
  onCambiarUbicacion: (vaca: Vaca) => void;
  onVerDetalles: (vaca: Vaca) => void;
  onMarcarMuerte: (vaca: Vaca) => void;
  onCambiarLote?: (vacaId: string, nuevoLote: string) => void;
  isLoading?: boolean;
}

const ListaVacas: React.FC<ListaVacasProps> = ({
  vacas,
  onEditar,
  onCambiarUbicacion,
  onVerDetalles,
  onMarcarMuerte,
  onCambiarLote,
  isLoading = false
}) => {
  const [filtro, setFiltro] = useState('');
  const [vacasFiltradas, setVacasFiltradas] = useState<Vaca[]>(vacas);
  const [lotesDisponibles, setLotesDisponibles] = useState<Array<{ _id: string; nombre: string }>>([]);

  // Cargar lotes disponibles
  useEffect(() => {
    const cargarLotes = async () => {
      try {
        const response = await fetch('/api/lotes?activo=true');
        if (response.ok) {
          const data = await response.json();
          setLotesDisponibles(data.lotes || []);
        }
      } catch (error) {
        console.error('Error al cargar lotes:', error);
      }
    };
    cargarLotes();
  }, []);

  useEffect(() => {
    if (filtro === '') {
      setVacasFiltradas(vacas);
    } else {
      const filtradas = vacas.filter(vaca =>
        vaca.numeroIdentificacion.toLowerCase().includes(filtro.toLowerCase()) ||
        (vaca.nombre && vaca.nombre.toLowerCase().includes(filtro.toLowerCase())) ||
        vaca.raza.toLowerCase().includes(filtro.toLowerCase())
      );
      setVacasFiltradas(filtradas);
    }
  }, [filtro, vacas]);

  const calcularEdad = (fechaNacimiento: string) => {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const getEstadoReproductivoLabel = (estado: string) => {
    const estados: { [key: string]: string } = {
      'vacia': 'Vacía',
      'gestante': 'Gestante',
      'lactante': 'Lactante',
      'secado': 'Secado',
      'no_apta': 'No Apta'
    };
    return estados[estado] || estado;
  };

  const getEstadoReproductivoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'vacia': 'bg-gray-100 text-gray-800',
      'gestante': 'bg-green-100 text-green-800',
      'lactante': 'bg-blue-100 text-blue-800',
      'secado': 'bg-yellow-100 text-yellow-800',
      'no_apta': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Lista de Vacas</h2>
          <span className="text-sm text-gray-600">
            {vacasFiltradas.length} de {vacas.length} vacas
          </span>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por número, nombre o raza..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-black"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Vista de escritorio - Tabla */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID / Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Raza
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Edad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sexo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lote/Grupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vacasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  {filtro ? 'No se encontraron vacas con ese criterio de búsqueda' : 'No hay vacas registradas'}
                </td>
              </tr>
            ) : (
              vacasFiltradas.map((vaca) => (
                <tr key={vaca._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {vaca.numeroIdentificacion}
                      </div>
                      {vaca.nombre && (
                        <div className="text-sm text-gray-500">{vaca.nombre}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vaca.raza}</div>
                    <div className="text-sm text-gray-500">{vaca.colorPelaje}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calcularEdad(vaca.fechaNacimiento)} años
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      vaca.sexo === 'hembra' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {vaca.sexo === 'hembra' ? 'Hembra' : 'Macho'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vaca.peso} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoReproductivoColor(vaca.estadoReproductivo)}`}>
                      {getEstadoReproductivoLabel(vaca.estadoReproductivo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {onCambiarLote ? (
                      <select
                        value={vaca.lote || ''}
                        onChange={(e) => onCambiarLote(vaca._id, e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="">Sin lote</option>
                        {lotesDisponibles.map((lote) => (
                          <option key={lote._id} value={lote.nombre}>
                            {lote.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900">{vaca.lote || 'Sin lote'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      {/* Botón principal - Ver Detalles */}
                      <button
                        onClick={() => onVerDetalles(vaca)}
                        className="w-full px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                        title="Ver detalles completos y genealogía"
                      >
                        <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalles
                      </button>
                      
                      {/* Botones secundarios */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onEditar(vaca)}
                          className="flex-1 px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
                          title="Editar información"
                        >
                          <svg className="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => onCambiarUbicacion(vaca)}
                          className="flex-1 px-2 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors duration-200"
                          title="Cambiar ubicación"
                        >
                          <svg className="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Ubicar
                        </button>
                      </div>
                      
                      {/* Botón de salida */}
                      <button
                        onClick={() => onMarcarMuerte(vaca)}
                        className="w-full px-2 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors duration-200"
                        title="Registrar salida del animal"
                      >
                        <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Registrar Salida
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista móvil - Tarjetas */}
      <div className="lg:hidden">
        {vacasFiltradas.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filtro ? 'No se encontraron vacas con ese criterio de búsqueda' : 'No hay vacas registradas'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {vacasFiltradas.map((vaca) => (
              <div key={vaca._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {vaca.numeroIdentificacion}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vaca.sexo === 'hembra' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vaca.sexo === 'hembra' ? 'Hembra' : 'Macho'}
                      </span>
                    </div>
                    {vaca.nombre && (
                      <p className="text-sm text-gray-600 mb-2">{vaca.nombre}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><span className="font-medium">Raza:</span> {vaca.raza}</div>
                      <div><span className="font-medium">Edad:</span> {calcularEdad(vaca.fechaNacimiento)} años</div>
                      <div><span className="font-medium">Peso:</span> {vaca.peso} kg</div>
                      <div><span className="font-medium">Ubicación:</span> {vaca.ubicacionActual}</div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoReproductivoColor(vaca.estadoReproductivo)}`}>
                        {getEstadoReproductivoLabel(vaca.estadoReproductivo)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Botón principal - Ver Detalles */}
                  <button
                    onClick={() => onVerDetalles(vaca)}
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                    title="Ver detalles completos y genealogía"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalles Completos
                  </button>
                  
                  {/* Botones secundarios */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditar(vaca)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
                      title="Editar información"
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => onCambiarUbicacion(vaca)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors duration-200"
                      title="Cambiar ubicación"
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ubicar
                    </button>
                  </div>
                  
                  {/* Botón de salida */}
                  <button
                    onClick={() => onMarcarMuerte(vaca)}
                    className="w-full px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors duration-200"
                    title="Registrar salida del animal"
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Registrar Salida
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaVacas;
