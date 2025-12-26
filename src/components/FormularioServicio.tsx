'use client';

import React, { useState, useEffect } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  sexo: string;
}

interface FormularioServicioProps {
  onSubmit: (datosServicio: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  vacasDisponibles?: Vaca[];
  onCancelar?: () => void;
}

const FormularioServicio: React.FC<FormularioServicioProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  vacasDisponibles = [],
  onCancelar
}) => {
  const [formData, setFormData] = useState({
    // Información de la vaca
    vacaId: datosIniciales.vacaId || '',
    numeroIdentificacionVaca: datosIniciales.numeroIdentificacionVaca || '',
    nombreVaca: datosIniciales.nombreVaca || '',

    // Información del servicio
    fechaServicio: datosIniciales.fechaServicio 
      ? new Date(datosIniciales.fechaServicio).toISOString().split('T')[0] 
      : '',
    tipoServicio: datosIniciales.tipoServicio || 'monta_natural',
    toroPadre: datosIniciales.toroPadre || '',
    semenToro: datosIniciales.semenToro || '',

    // Seguimiento
    pesoInicial: datosIniciales.pesoInicial || '',

    // Cuidados especiales
    dietaEspecial: datosIniciales.dietaEspecial || '',
    medicamentos: Array.isArray(datosIniciales.medicamentos) 
      ? datosIniciales.medicamentos.join(', ') 
      : (datosIniciales.medicamentos || ''),
    restricciones: Array.isArray(datosIniciales.restricciones) 
      ? datosIniciales.restricciones.join(', ') 
      : (datosIniciales.restricciones || ''),
    ejercicioRecomendado: datosIniciales.ejercicioRecomendado || ''
  });

  const [mostrarVacas, setMostrarVacas] = useState(false);
  const [busquedaVaca, setBusquedaVaca] = useState('');

  useEffect(() => {
    if (datosIniciales.numeroIdentificacionVaca) {
      setBusquedaVaca(datosIniciales.numeroIdentificacionVaca);
    }
  }, [datosIniciales]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVacaSeleccionada = (vaca: Vaca) => {
    setFormData(prev => ({
      ...prev,
      vacaId: vaca._id,
      numeroIdentificacionVaca: vaca.numeroIdentificacion,
      nombreVaca: vaca.nombre || ''
    }));
    setBusquedaVaca(vaca.numeroIdentificacion);
    setMostrarVacas(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos para enviar
    const datosParaEnviar = {
      ...formData,
      pesoInicial: formData.pesoInicial ? parseFloat(String(formData.pesoInicial)) : undefined,
      fechaServicio: formData.fechaServicio ? new Date(formData.fechaServicio) : undefined,
      medicamentos: formData.medicamentos 
        ? (typeof formData.medicamentos === 'string' 
          ? formData.medicamentos.split(',').map((m: string) => m.trim()).filter(m => m) 
          : formData.medicamentos)
        : [],
      restricciones: formData.restricciones 
        ? (typeof formData.restricciones === 'string' 
          ? formData.restricciones.split(',').map((r: string) => r.trim()).filter(r => r) 
          : formData.restricciones)
        : [],
      // Estado por defecto para nuevo servicio
      estado: 'en_gestacion'
    };

    onSubmit(datosParaEnviar);
  };

  // Filtrar vacas por búsqueda
  const vacasFiltradas = vacasDisponibles.filter(vaca =>
    vaca.numeroIdentificacion.toLowerCase().includes(busquedaVaca.toLowerCase()) ||
    (vaca.nombre && vaca.nombre.toLowerCase().includes(busquedaVaca.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Registrar Servicio/Monta
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registra cuando una vaca ha sido servida o inseminada
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
            Paso 1: Servicio
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Vaca */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Seleccionar Vaca
          </h3>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Vaca *
            </label>
            <input
              type="text"
              value={busquedaVaca}
              onChange={(e) => {
                setBusquedaVaca(e.target.value);
                setMostrarVacas(true);
              }}
              onFocus={() => setMostrarVacas(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Buscar por número de ID o nombre"
              required
            />
            {mostrarVacas && vacasFiltradas.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {vacasFiltradas.map((vaca) => (
                  <div
                    key={vaca._id}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleVacaSeleccionada(vaca)}
                  >
                    <div className="font-medium text-gray-900">{vaca.numeroIdentificacion}</div>
                    {vaca.nombre && (
                      <div className="text-sm text-gray-500">{vaca.nombre}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {formData.vacaId && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Vaca seleccionada
              </div>
            )}
          </div>
        </div>

        {/* Información del Servicio */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Datos del Servicio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Servicio
              </label>
              <input
                type="date"
                name="fechaServicio"
                value={formData.fechaServicio}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional - Si no conoces la fecha exacta, déjala en blanco
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio *
              </label>
              <select
                name="tipoServicio"
                value={formData.tipoServicio}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="monta_natural">Monta Natural</option>
                <option value="inseminacion_artificial">Inseminación Artificial</option>
                <option value="transferencia_embrion">Transferencia de Embrión</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toro Padre
              </label>
              <input
                type="text"
                name="toroPadre"
                value={formData.toroPadre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="ID o nombre del toro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Información del Semen
              </label>
              <input
                type="text"
                name="semenToro"
                value={formData.semenToro}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Número de lote, origen, etc."
              />
            </div>
          </div>
        </div>

        {/* Seguimiento Inicial */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Datos Iniciales (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Inicial (kg)
              </label>
              <input
                type="number"
                name="pesoInicial"
                value={formData.pesoInicial}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 450.5"
              />
            </div>
          </div>
        </div>

        {/* Cuidados Especiales */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Cuidados Especiales (Opcional)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dieta Especial
              </label>
              <textarea
                name="dietaEspecial"
                value={formData.dietaEspecial}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Descripción de la dieta especial"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicamentos
                </label>
                <input
                  type="text"
                  name="medicamentos"
                  value={formData.medicamentos}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Separar con comas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restricciones
                </label>
                <input
                  type="text"
                  name="restricciones"
                  value={formData.restricciones}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Separar con comas"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ejercicio Recomendado
              </label>
              <textarea
                name="ejercicioRecomendado"
                value={formData.ejercicioRecomendado}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Recomendaciones de ejercicio"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !formData.vacaId || !formData.tipoServicio}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : 'Registrar Servicio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioServicio;

