'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  vacas: {
    total: number;
    activas: number;
    gestantes: number;
    lactantes: number;
    inactivas: number;
  };
  gestacion: {
    activas: number;
    criticas: number;
    proximas: number;
    proximosPartos: Array<{
      numeroIdentificacionVaca: string;
      nombreVaca?: string;
      fechaProbableParto: string;
      diasGestacionActual: number;
    }>;
  };
  produccionLechera: {
    totalLitros30Dias: number;
    totalLitros7Dias: number;
    promedioDiario30Dias: number;
    promedioDiario7Dias: number;
    topProductoras: Array<{
      numeroIdentificacion: string;
      nombre?: string;
      total: number;
    }>;
    produccionDiaria: Array<{
      fecha: string;
      total: number;
    }>;
  };
  sanitario: {
    procedimientosPendientes: number;
    procedimientosVencidos: number;
    proximosProcedimientos: Array<{
      tipo: string;
      nombre: string;
      numeroIdentificacionVaca: string;
      nombreVaca?: string;
      proximaFecha: string;
    }>;
  };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Error al cargar el dashboard');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setError('Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  };

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

  const calcularDiasRestantes = (fechaParto: string) => {
    const hoy = new Date();
    const parto = new Date(fechaParto);
    const dias = Math.ceil((parto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          {error || 'Error al cargar los datos'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 Dashboard General
          </h1>
          <p className="text-gray-600">
            Visión general de tu operación ganadera
          </p>
        </div>

        {/* KPIs Principales - Vacas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Vacas</p>
                <p className="text-3xl font-bold text-gray-800">{data.vacas.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{data.vacas.activas} activas</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Gestantes</p>
                <p className="text-3xl font-bold text-green-600">{data.vacas.gestantes}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <Link href="/gestacion" className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Ver gestaciones →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Lactantes</p>
                <p className="text-3xl font-bold text-purple-600">{data.vacas.lactantes}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <Link href="/produccion-lechera" className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Ver producción →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Partos Críticos</p>
                <p className="text-3xl font-bold text-red-600">{data.gestacion.criticas}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">0-14 días para parir</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Procedimientos</p>
                <p className="text-3xl font-bold text-orange-600">{data.sanitario.procedimientosPendientes}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">{data.sanitario.procedimientosVencidos} vencidos</span>
            </div>
          </div>
        </div>

        {/* Producción Lechera */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Producción */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🥛 Producción Últimos 7 Días
            </h2>
            <div className="space-y-4">
              {data.produccionLechera.produccionDiaria.map((dia, index) => {
                const maxTotal = Math.max(...data.produccionLechera.produccionDiaria.map(d => d.total));
                const percentage = maxTotal > 0 ? (dia.total / maxTotal) * 100 : 0;
                
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="font-semibold text-gray-800">{dia.total} L</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Promedio Diario (30d)</p>
                <p className="text-2xl font-bold text-blue-600">{data.produccionLechera.promedioDiario30Dias.toFixed(1)} L</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total (30d)</p>
                <p className="text-2xl font-bold text-gray-800">{data.produccionLechera.totalLitros30Dias.toFixed(0)} L</p>
              </div>
            </div>
          </div>

          {/* Top Productoras */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🏆 Top Productoras (Últimos 30 días)
            </h2>
            {data.produccionLechera.topProductoras.length > 0 ? (
              <div className="space-y-3">
                {data.produccionLechera.topProductoras.map((vaca, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{vaca.numeroIdentificacion}</p>
                        {vaca.nombre && <p className="text-sm text-gray-500">{vaca.nombre}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{vaca.total.toFixed(1)} L</p>
                      <p className="text-xs text-gray-500">{(vaca.total / 30).toFixed(1)} L/día</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos de producción</p>
            )}
            <Link 
              href="/produccion-lechera"
              className="mt-4 block text-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver toda la producción →
            </Link>
          </div>
        </div>

        {/* Próximos Partos y Procedimientos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Próximos Partos */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              🤰 Próximos Partos
              {data.gestacion.criticas > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                  {data.gestacion.criticas} críticos
                </span>
              )}
            </h2>
            {data.gestacion.proximosPartos.length > 0 ? (
              <div className="space-y-3">
                {data.gestacion.proximosPartos.map((parto, index) => {
                  const diasRestantes = calcularDiasRestantes(parto.fechaProbableParto);
                  const esCritico = diasRestantes <= 14;
                  const esProximo = diasRestantes > 14 && diasRestantes <= 30;
                  
                  return (
                    <div key={index} className={`p-3 rounded-lg ${
                      esCritico ? 'bg-red-50 border border-red-200' : 
                      esProximo ? 'bg-yellow-50 border border-yellow-200' : 
                      'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{parto.numeroIdentificacionVaca}</p>
                          {parto.nombreVaca && <p className="text-sm text-gray-600">{parto.nombreVaca}</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            {parto.diasGestacionActual} días de gestación
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            esCritico ? 'text-red-600' : esProximo ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {diasRestantes} días
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(parto.fechaProbableParto).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay partos próximos</p>
            )}
            <Link 
              href="/gestacion"
              className="mt-4 block text-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas las gestaciones →
            </Link>
          </div>

          {/* Próximos Procedimientos */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              💉 Próximos Procedimientos
              {data.sanitario.procedimientosVencidos > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                  {data.sanitario.procedimientosVencidos} vencidos
                </span>
              )}
            </h2>
            {data.sanitario.proximosProcedimientos.length > 0 ? (
              <div className="space-y-3">
                {data.sanitario.proximosProcedimientos.map((proc, index) => {
                  const fecha = new Date(proc.proximaFecha);
                  const hoy = new Date();
                  const diasHasta = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                  const esVencido = diasHasta < 0;
                  const esUrgente = diasHasta >= 0 && diasHasta <= 7;
                  
                  return (
                    <div key={index} className={`p-3 rounded-lg ${
                      esVencido ? 'bg-red-50 border border-red-200' :
                      esUrgente ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              proc.tipo === 'vacuna' ? 'bg-blue-100 text-blue-800' :
                              proc.tipo === 'desparasitacion' ? 'bg-green-100 text-green-800' :
                              proc.tipo === 'tratamiento' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getTipoLabel(proc.tipo)}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800 mt-1">{proc.nombre}</p>
                          <p className="text-sm text-gray-600">
                            {proc.numeroIdentificacionVaca}
                            {proc.nombreVaca && ` - ${proc.nombreVaca}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            esVencido ? 'text-red-600' :
                            esUrgente ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {esVencido ? 'Vencido' : `${diasHasta} días`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {fecha.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay procedimientos próximos</p>
            )}
            <Link 
              href="/gestion-sanitaria"
              className="mt-4 block text-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver gestión sanitaria →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

