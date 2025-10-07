'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TrazabilidadVaca from './TrazabilidadVaca';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  sexo: string;
  raza: string;
  fechaNacimiento: string;
}

interface EstadisticasGenerales {
  totalVacasConGestacion: number;
  promedioGestacionesPorVaca: string;
  vacasMasProductivas: Array<{
    numeroIdentificacion: string;
    nombre?: string;
    totalGestaciones: number;
    partosExitosos: number;
  }>;
}

const TrazabilidadGestacionApp: React.FC = () => {
  const [vacas, setVacas] = useState<Vaca[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales | null>(null);
  const [vacaSeleccionada, setVacaSeleccionada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [vacasRes, estadisticasRes] = await Promise.all([
        fetch('/api/vacas'),
        fetch('/api/gestacion/estadisticas')
      ]);

      if (!vacasRes.ok || !estadisticasRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [vacasData, estadisticasData] = await Promise.all([
        vacasRes.json(),
        estadisticasRes.json()
      ]);

      setVacas(vacasData.vacas || []);
      
      // Calcular estadísticas generales
      const totalVacas = vacasData.vacas?.length || 0;
      const totalGestaciones = estadisticasData.resumen?.totalGestaciones || 0;
      
      setEstadisticas({
        totalVacasConGestacion: totalVacas,
        promedioGestacionesPorVaca: totalVacas > 0 ? (totalGestaciones / totalVacas).toFixed(1) : '0',
        vacasMasProductivas: [] // Esto se calcularía con una consulta más específica
      });

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const vacasFiltradas = vacas.filter(vaca =>
    vaca.numeroIdentificacion.toLowerCase().includes(busqueda.toLowerCase()) ||
    (vaca.nombre && vaca.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
    vaca.raza.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSeleccionarVaca = (vacaId: string) => {
    setVacaSeleccionada(vacaId);
  };

  const handleVolver = () => {
    setVacaSeleccionada(null);
  };

  if (vacaSeleccionada) {
    return <TrazabilidadVaca vacaId={vacaSeleccionada} onVolver={handleVolver} />;
  }

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Trazabilidad de Gestación
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Historial completo del ciclo reproductivo de cada vaca
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link
                href="/gestacion"
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-center text-sm sm:text-base"
              >
                🐄 Gestión de Gestación
              </Link>
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-center text-sm sm:text-base"
              >
                📋 Registro de Vacas
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        {estadisticas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Vacas</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalVacasConGestacion}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Promedio Gestaciones/Vaca</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.promedioGestacionesPorVaca}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sistema Activo</p>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Seleccionar Vaca para Ver Trazabilidad
            </h2>
            <span className="text-sm text-gray-600">
              {vacasFiltradas.length} de {vacas.length} vacas
            </span>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar vaca por número, nombre o raza..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Lista de Vacas */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">
              Vacas Registradas
            </h3>
          </div>

          <div className="overflow-x-auto">
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
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vacasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {busqueda ? 'No se encontraron vacas con ese criterio' : 'No hay vacas registradas'}
                    </td>
                  </tr>
                ) : (
                  vacasFiltradas.map((vaca) => {
                    const edad = Math.floor((new Date().getTime() - new Date(vaca.fechaNacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365));
                    
                    return (
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{edad} años</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            vaca.sexo === 'hembra' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {vaca.sexo === 'hembra' ? 'Hembra' : 'Macho'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleSeleccionarVaca(vaca._id)}
                            className="text-green-600 hover:text-green-900 font-semibold"
                          >
                            Ver Trazabilidad →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrazabilidadGestacionApp;
