'use client';

import React, { useState, useEffect } from 'react';
import FormularioProduccionLechera from './FormularioProduccionLechera';
import FormularioProduccionFinca from './FormularioProduccionFinca';
import ListaProduccionLechera from './ListaProduccionLechera';
import ListaProduccionFinca from './ListaProduccionFinca';
import FiltrosReporteProduccion from './FiltrosReporteProduccion';
import { generarReporteExcel } from '@/utils/generarReporteProduccion';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
}

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

const GestionProduccionLecheraApp: React.FC = () => {
  const [tipoRegistro, setTipoRegistro] = useState<'por_vaca' | 'total_finca'>('por_vaca');
  const [producciones, setProducciones] = useState<ProduccionLechera[]>([]);
  const [produccionesFinca, setProduccionesFinca] = useState<ProduccionFinca[]>([]);
  const [vacas, setVacas] = useState<Vaca[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [produccionEditando, setProduccionEditando] = useState<ProduccionLechera | null>(null);
  const [produccionFincaEditando, setProduccionFincaEditando] = useState<ProduccionFinca | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mostrarReportes, setMostrarReportes] = useState(false);
  const [isGenerandoReporte, setIsGenerandoReporte] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [produccionesRes, produccionesFincaRes, vacasRes] = await Promise.all([
        fetch('/api/produccion-lechera?limit=1000'),
        fetch('/api/produccion-finca?limit=1000'),
        fetch('/api/vacas?limit=1000')
      ]);

      if (!produccionesRes.ok || !produccionesFincaRes.ok || !vacasRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [produccionesData, produccionesFincaData, vacasData] = await Promise.all([
        produccionesRes.json(),
        produccionesFincaRes.json(),
        vacasRes.json()
      ]);

      setProducciones(produccionesData.producciones || []);
      setProduccionesFinca(produccionesFincaData.producciones || []);
      setVacas(vacasData.vacas || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (datos: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const url = produccionEditando 
        ? `/api/produccion-lechera/${(produccionEditando as any)._id}`
        : '/api/produccion-lechera';
      
      const response = await fetch(url, {
        method: produccionEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      setSuccessMessage(produccionEditando ? 'Registro actualizado' : 'Registro creado');
      setMostrarFormulario(false);
      setProduccionEditando(null);
      await cargarDatos();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/produccion-lechera/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setSuccessMessage('Registro eliminado');
      await cargarDatos();
    } catch (err) {
      setError('Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFinca = async (datos: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const url = produccionFincaEditando 
        ? `/api/produccion-finca/${produccionFincaEditando._id}`
        : '/api/produccion-finca';
      
      const response = await fetch(url, {
        method: produccionFincaEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      setSuccessMessage(produccionFincaEditando ? 'Registro actualizado' : 'Registro creado');
      setMostrarFormulario(false);
      setProduccionFincaEditando(null);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarFinca = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/produccion-finca/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setSuccessMessage('Registro eliminado');
      await cargarDatos();
    } catch (err) {
      setError('Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerarReporte = async (fechaInicio: string, fechaFin: string) => {
    setIsGenerandoReporte(true);
    try {
      // Obtener datos del período específico
      const response = await fetch(
        `/api/produccion-lechera?limit=10000&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );

      if (!response.ok) {
        throw new Error('Error al obtener datos para el reporte');
      }

      const data = await response.json();
      const produccionesReporte = data.producciones || [];

      if (produccionesReporte.length === 0) {
        alert('No hay datos en el período seleccionado');
        return;
      }

      // Generar y descargar el archivo
      generarReporteExcel(produccionesReporte, fechaInicio, fechaFin);
      
      setSuccessMessage(`Reporte generado: ${produccionesReporte.length} registros descargados`);
    } catch (err) {
      setError('Error al generar el reporte');
      console.error('Error:', err);
    } finally {
      setIsGenerandoReporte(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🥛 Producción Lechera
          </h1>
          <p className="text-gray-600">
            Gestiona y analiza la producción diaria de leche
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {mostrarFormulario ? (
          tipoRegistro === 'por_vaca' ? (
            <FormularioProduccionLechera
              onSubmit={handleSubmit}
              isLoading={isLoading}
              datosIniciales={produccionEditando || {}}
              vacasDisponibles={vacas}
              onCancelar={() => {
                setMostrarFormulario(false);
                setProduccionEditando(null);
              }}
            />
          ) : (
            <FormularioProduccionFinca
              onSubmit={handleSubmitFinca}
              isLoading={isLoading}
              datosIniciales={produccionFincaEditando || {}}
              onCancelar={() => {
                setMostrarFormulario(false);
                setProduccionFincaEditando(null);
              }}
            />
          )
        ) : (
          <div className="space-y-6">
            {/* Selector de Tipo de Registro */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Tipo de Registro:</span>
                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => setTipoRegistro('por_vaca')}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                      tipoRegistro === 'por_vaca'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Por Vaca Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoRegistro('total_finca')}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                      tipoRegistro === 'total_finca'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Total de la Finca
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {tipoRegistro === 'por_vaca' ? 'Producción por Vaca' : 'Producción Total Diaria'}
              </h2>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setMostrarReportes(!mostrarReportes)}
                  className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-colors ${
                    mostrarReportes
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {mostrarReportes ? 'Ocultar' : 'Reportes'}
                </button>
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className={`flex-1 sm:flex-none text-white px-6 py-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 font-medium ${
                    tipoRegistro === 'por_vaca' ? 'bg-blue-600' : 'bg-green-600'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nuevo Registro
                </button>
              </div>
            </div>

            {/* Panel de Reportes */}
            {mostrarReportes && (
              <FiltrosReporteProduccion
                onGenerarReporte={handleGenerarReporte}
                isGenerando={isGenerandoReporte}
              />
            )}

            {/* Lista según el tipo de registro */}
            {tipoRegistro === 'por_vaca' ? (
              <ListaProduccionLechera
                producciones={producciones}
                onEditar={(prod) => {
                  setProduccionEditando(prod);
                  setMostrarFormulario(true);
                }}
                onEliminar={handleEliminar}
                isLoading={isLoading}
              />
            ) : (
              <ListaProduccionFinca
                producciones={produccionesFinca}
                onEditar={(prod) => {
                  setProduccionFincaEditando(prod);
                  setMostrarFormulario(true);
                }}
                onEliminar={handleEliminarFinca}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionProduccionLecheraApp;

