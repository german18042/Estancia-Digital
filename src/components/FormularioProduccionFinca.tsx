'use client';

import React, { useState } from 'react';

interface FormularioProduccionFincaProps {
  onSubmit: (datos: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  onCancelar?: () => void;
}

const FormularioProduccionFinca: React.FC<FormularioProduccionFincaProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  onCancelar
}) => {
  const [formData, setFormData] = useState({
    fecha: datosIniciales.fecha 
      ? new Date(datosIniciales.fecha).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    totalLitros: datosIniciales.totalLitros || '',
    numeroVacasOrdenadas: datosIniciales.numeroVacasOrdenadas || '',
    grasaPromedio: datosIniciales.grasaPromedio || '',
    proteinaPromedio: datosIniciales.proteinaPromedio || '',
    costoAlimentacion: datosIniciales.costoAlimentacion || '',
    costoManoObra: datosIniciales.costoManoObra || '',
    otrosCostos: datosIniciales.otrosCostos || '',
    observaciones: datosIniciales.observaciones || '',
    clima: datosIniciales.clima || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const datosParaEnviar = {
      fecha: new Date(formData.fecha),
      totalLitros: parseFloat(formData.totalLitros),
      numeroVacasOrdenadas: formData.numeroVacasOrdenadas ? parseInt(formData.numeroVacasOrdenadas) : undefined,
      grasaPromedio: formData.grasaPromedio ? parseFloat(formData.grasaPromedio) : undefined,
      proteinaPromedio: formData.proteinaPromedio ? parseFloat(formData.proteinaPromedio) : undefined,
      costoAlimentacion: formData.costoAlimentacion ? parseFloat(formData.costoAlimentacion) : undefined,
      costoManoObra: formData.costoManoObra ? parseFloat(formData.costoManoObra) : undefined,
      otrosCostos: formData.otrosCostos ? parseFloat(formData.otrosCostos) : undefined,
      observaciones: formData.observaciones || undefined,
      clima: formData.clima || undefined
    };

    onSubmit(datosParaEnviar);
  };

  const promedioPorVaca = formData.totalLitros && formData.numeroVacasOrdenadas
    ? (parseFloat(formData.totalLitros) / parseInt(formData.numeroVacasOrdenadas)).toFixed(2)
    : null;

  const costoTotal = 
    (parseFloat(formData.costoAlimentacion) || 0) +
    (parseFloat(formData.costoManoObra) || 0) +
    (parseFloat(formData.otrosCostos) || 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {datosIniciales._id ? 'Editar Registro' : 'Producción Total de la Finca'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registra la producción total de todas las vacas del día
          </p>
        </div>
        {formData.totalLitros && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Total del día</p>
            <p className="text-4xl font-bold text-green-600">{parseFloat(formData.totalLitros).toFixed(1)} L</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-3 border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-lg"
          />
        </div>

        {/* Producción Total */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Producción Total de la Finca
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total de Litros del Día *
              </label>
              <input
                type="number"
                name="totalLitros"
                value={formData.totalLitros}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="w-full px-4 py-4 border-2 border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-xl font-bold"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Vacas Ordeñadas
              </label>
              <input
                type="number"
                name="numeroVacasOrdenadas"
                value={formData.numeroVacasOrdenadas}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-lg"
                placeholder="0"
              />
              {promedioPorVaca && (
                <p className="text-sm text-green-600 font-medium mt-2">
                  📊 Promedio: {promedioPorVaca} L/vaca
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Calidad Promedio */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Calidad Promedio (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grasa Promedio (%)
              </label>
              <input
                type="number"
                name="grasaPromedio"
                value={formData.grasaPromedio}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 3.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proteína Promedio (%)
              </label>
              <input
                type="number"
                name="proteinaPromedio"
                value={formData.proteinaPromedio}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 3.2"
              />
            </div>
          </div>
        </div>

        {/* Costos del Día */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Costos del Día (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alimentación ($)
              </label>
              <input
                type="number"
                name="costoAlimentacion"
                value={formData.costoAlimentacion}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mano de Obra ($)
              </label>
              <input
                type="number"
                name="costoManoObra"
                value={formData.costoManoObra}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otros Costos ($)
              </label>
              <input
                type="number"
                name="otrosCostos"
                value={formData.otrosCostos}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                placeholder="0.00"
              />
            </div>
          </div>
          {costoTotal > 0 && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-300">
              <p className="text-sm text-gray-600">Costo Total del Día:</p>
              <p className="text-2xl font-bold text-yellow-700">${costoTotal.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Observaciones y Clima */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clima
            </label>
            <select
              name="clima"
              value={formData.clima}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            >
              <option value="">Seleccionar...</option>
              <option value="soleado">☀️ Soleado</option>
              <option value="nublado">☁️ Nublado</option>
              <option value="lluvioso">🌧️ Lluvioso</option>
              <option value="caluroso">🔥 Caluroso</option>
              <option value="frio">❄️ Frío</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Observaciones generales del día..."
            />
          </div>
        </div>

        {/* Información útil */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 Ventajas del registro total:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Registro ultra rápido - solo el total</li>
                <li>Perfecto para fincas pequeñas/medianas</li>
                <li>Incluye análisis de costos del día</li>
                <li>Calcula promedio por vaca automáticamente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !formData.totalLitros}
            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : datosIniciales._id ? 'Actualizar Registro' : 'Guardar Producción del Día'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioProduccionFinca;

