'use client';

import React, { useState } from 'react';

interface FiltrosReporteProduccionProps {
  onGenerarReporte: (fechaInicio: string, fechaFin: string) => void;
  isGenerando?: boolean;
}

const FiltrosReporteProduccion: React.FC<FiltrosReporteProduccionProps> = ({
  onGenerarReporte,
  isGenerando = false
}) => {
  const [tipoFiltro, setTipoFiltro] = useState<'predefinido' | 'personalizado'>('predefinido');
  const [periodoPredefinido, setPeriodoPredefinido] = useState('7dias');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const calcularFechas = (periodo: string): { inicio: string; fin: string } => {
    const hoy = new Date();
    const fin = hoy.toISOString().split('T')[0];
    const inicioDate = new Date(hoy);

    switch (periodo) {
      case '7dias':
        inicioDate.setDate(inicioDate.getDate() - 7);
        break;
      case '14dias':
        inicioDate.setDate(inicioDate.getDate() - 14);
        break;
      case 'mensual':
        inicioDate.setDate(inicioDate.getDate() - 30);
        break;
      case 'trimestral':
        inicioDate.setDate(inicioDate.getDate() - 90);
        break;
      default:
        inicioDate.setDate(inicioDate.getDate() - 7);
    }

    return {
      inicio: inicioDate.toISOString().split('T')[0],
      fin
    };
  };

  const handleDescargar = () => {
    let fechas;

    if (tipoFiltro === 'predefinido') {
      fechas = calcularFechas(periodoPredefinido);
    } else {
      if (!fechaInicio || !fechaFin) {
        alert('Por favor selecciona ambas fechas');
        return;
      }
      fechas = { inicio: fechaInicio, fin: fechaFin };
    }

    onGenerarReporte(fechas.inicio, fechas.fin);
  };

  const getPeriodoLabel = (periodo: string) => {
    const labels: { [key: string]: string } = {
      '7dias': 'Últimos 7 Días',
      '14dias': 'Últimas 2 Semanas',
      'mensual': 'Último Mes (30 días)',
      'trimestral': 'Último Trimestre (90 días)'
    };
    return labels[periodo] || periodo;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generar Reporte
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Descarga reportes de producción en formato Excel
          </p>
        </div>
      </div>

      {/* Selector de Tipo de Filtro */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setTipoFiltro('predefinido')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            tipoFiltro === 'predefinido'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Períodos Predefinidos
        </button>
        <button
          type="button"
          onClick={() => setTipoFiltro('personalizado')}
          className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            tipoFiltro === 'personalizado'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Rango Personalizado
        </button>
      </div>

      {/* Opciones de Filtro */}
      <div className="mb-6">
        {tipoFiltro === 'predefinido' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {['7dias', '14dias', 'mensual', 'trimestral'].map((periodo) => (
              <button
                key={periodo}
                type="button"
                onClick={() => setPeriodoPredefinido(periodo)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  periodoPredefinido === periodo
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {getPeriodoLabel(periodo)}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={fechaInicio}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Información del Reporte */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">El reporte incluirá:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Producción diaria detallada por vaca</li>
              <li>Totales por ordeño (mañana, tarde, noche)</li>
              <li>Estadísticas resumen (total, promedio, máximo, mínimo)</li>
              <li>Gráfico de producción diaria</li>
              <li>Ranking de vacas productoras</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botón de Descarga */}
      <button
        type="button"
        onClick={handleDescargar}
        disabled={isGenerando || (tipoFiltro === 'personalizado' && (!fechaInicio || !fechaFin))}
        className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
      >
        {isGenerando ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando Reporte...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Reporte Excel
          </span>
        )}
      </button>
    </div>
  );
};

export default FiltrosReporteProduccion;

