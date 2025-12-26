'use client';

import React, { useState } from 'react';

interface FormularioConfirmacionProps {
  gestacion: any;
  onSubmit: (datosConfirmacion: any) => void;
  isLoading?: boolean;
  onCancelar?: () => void;
}

const FormularioConfirmacion: React.FC<FormularioConfirmacionProps> = ({
  gestacion,
  onSubmit,
  isLoading = false,
  onCancelar
}) => {
  const [formData, setFormData] = useState({
    fechaConfirmacion: gestacion.fechaConfirmacion 
      ? new Date(gestacion.fechaConfirmacion).toISOString().split('T')[0] 
      : '',
    diasGestacionConfirmados: gestacion.diasGestacionConfirmados || '',
    metodoConfirmacion: gestacion.metodoConfirmacion || '',
    confirmadoPor: gestacion.confirmadoPor || '',
    pesoActual: gestacion.pesoActual || '',
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
    
    // Preparar datos para enviar
    const datosParaEnviar = {
      fechaConfirmacion: formData.fechaConfirmacion ? new Date(formData.fechaConfirmacion) : undefined,
      diasGestacionConfirmados: formData.diasGestacionConfirmados ? parseInt(String(formData.diasGestacionConfirmados)) : undefined,
      metodoConfirmacion: formData.metodoConfirmacion || undefined,
      confirmadoPor: formData.confirmadoPor || undefined,
      pesoActual: formData.pesoActual ? parseFloat(String(formData.pesoActual)) : undefined,
    };

    onSubmit(datosParaEnviar);
  };

  // Calcular información útil
  const fechaServicio = gestacion.fechaServicio ? new Date(gestacion.fechaServicio) : null;
  const hoy = new Date();
  const diasDesdeServicio = fechaServicio 
    ? Math.floor((hoy.getTime() - fechaServicio.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Confirmar Gestación
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registra los datos de confirmación del veterinario
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
            Paso 2: Confirmación
          </span>
        </div>
      </div>

      {/* Información del servicio existente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Información del Servicio Registrado
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Vaca:</span>
            <div className="font-medium text-gray-900">{gestacion.numeroIdentificacionVaca}</div>
          </div>
          {fechaServicio && (
            <div>
              <span className="text-gray-600">Fecha Servicio:</span>
              <div className="font-medium text-gray-900">{fechaServicio.toLocaleDateString()}</div>
            </div>
          )}
          {diasDesdeServicio !== null && (
            <div>
              <span className="text-gray-600">Días desde servicio:</span>
              <div className="font-medium text-gray-900">{diasDesdeServicio} días</div>
            </div>
          )}
          <div>
            <span className="text-gray-600">Tipo:</span>
            <div className="font-medium text-gray-900">
              {gestacion.tipoServicio === 'monta_natural' && 'Monta Natural'}
              {gestacion.tipoServicio === 'inseminacion_artificial' && 'Inseminación Artificial'}
              {gestacion.tipoServicio === 'transferencia_embrion' && 'Transferencia de Embrión'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos de Confirmación */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Datos de Confirmación Veterinaria
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Confirmación *
              </label>
              <input
                type="date"
                name="fechaConfirmacion"
                value={formData.fechaConfirmacion}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fecha en que el veterinario confirmó la gestación
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de Gestación Confirmados *
              </label>
              <input
                type="number"
                name="diasGestacionConfirmados"
                value={formData.diasGestacionConfirmados}
                onChange={handleChange}
                min="1"
                max="283"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Ej: 45, 60, 90"
              />
              <p className="text-xs text-gray-500 mt-1">
                Días según el diagnóstico del veterinario
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Confirmación *
              </label>
              <select
                name="metodoConfirmacion"
                value={formData.metodoConfirmacion}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="">Seleccionar método</option>
                <option value="palpacion">Palpación Rectal</option>
                <option value="ecografia">Ecografía</option>
                <option value="analisis_sangre">Análisis de Sangre</option>
                <option value="observacion_comportamiento">Observación de Comportamiento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmado Por
              </label>
              <input
                type="text"
                name="confirmadoPor"
                value={formData.confirmadoPor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Nombre del veterinario"
              />
            </div>
          </div>
        </div>

        {/* Seguimiento Actual */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Actualizar Seguimiento (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Actual (kg)
              </label>
              <input
                type="number"
                name="pesoActual"
                value={formData.pesoActual}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 475.2"
              />
              {gestacion.pesoInicial && formData.pesoActual && (
                <p className="text-xs text-gray-600 mt-1">
                  Ganancia: {(parseFloat(formData.pesoActual) - gestacion.pesoInicial).toFixed(1)} kg
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de cálculo automático */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Cálculos automáticos</p>
              <p>
                Al confirmar la gestación, el sistema calculará automáticamente:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fecha estimada de servicio (basada en los días confirmados)</li>
                <li>Fecha probable de parto (servicio + 283 días)</li>
                <li>Días restantes hasta el parto</li>
                <li>Trimestre actual de gestación</li>
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
            disabled={isLoading}
            className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirmando...
              </span>
            ) : 'Confirmar Gestación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioConfirmacion;

