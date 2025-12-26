'use client';

import React, { useState, useEffect } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
}

interface FormularioProduccionLecheraProps {
  onSubmit: (datos: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  vacasDisponibles?: Vaca[];
  onCancelar?: () => void;
}

const FormularioProduccionLechera: React.FC<FormularioProduccionLecheraProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  vacasDisponibles = [],
  onCancelar
}) => {
  const [modoRegistro, setModoRegistro] = useState<'por_ordeno' | 'total_diario'>('por_ordeno');
  const [formData, setFormData] = useState({
    vacaId: datosIniciales.vacaId || '',
    numeroIdentificacionVaca: datosIniciales.numeroIdentificacionVaca || '',
    nombreVaca: datosIniciales.nombreVaca || '',
    fecha: datosIniciales.fecha 
      ? new Date(datosIniciales.fecha).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    ordenoManana: datosIniciales.ordenoManana || '',
    ordenoTarde: datosIniciales.ordenoTarde || '',
    ordenoNoche: datosIniciales.ordenoNoche || '',
    totalDiario: datosIniciales.totalDia || '',
    grasa: datosIniciales.grasa || '',
    proteina: datosIniciales.proteina || '',
    celulasSomaticas: datosIniciales.celulasSomaticas || '',
    observaciones: datosIniciales.observaciones || '',
    anomalias: datosIniciales.anomalias || ''
  });

  const [mostrarVacas, setMostrarVacas] = useState(false);
  const [busquedaVaca, setBusquedaVaca] = useState('');
  const [totalCalculado, setTotalCalculado] = useState(0);

  useEffect(() => {
    if (datosIniciales.numeroIdentificacionVaca) {
      setBusquedaVaca(datosIniciales.numeroIdentificacionVaca);
    }
  }, [datosIniciales]);

  // Calcular total en tiempo real según el modo
  useEffect(() => {
    if (modoRegistro === 'por_ordeno') {
      const manana = parseFloat(formData.ordenoManana) || 0;
      const tarde = parseFloat(formData.ordenoTarde) || 0;
      const noche = parseFloat(formData.ordenoNoche) || 0;
      setTotalCalculado(manana + tarde + noche);
    } else {
      setTotalCalculado(parseFloat(formData.totalDiario) || 0);
    }
  }, [modoRegistro, formData.ordenoManana, formData.ordenoTarde, formData.ordenoNoche, formData.totalDiario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    
    let datosParaEnviar: any = {
      vacaId: formData.vacaId,
      numeroIdentificacionVaca: formData.numeroIdentificacionVaca,
      nombreVaca: formData.nombreVaca,
      fecha: new Date(formData.fecha),
      grasa: formData.grasa ? parseFloat(formData.grasa) : undefined,
      proteina: formData.proteina ? parseFloat(formData.proteina) : undefined,
      celulasSomaticas: formData.celulasSomaticas ? parseInt(formData.celulasSomaticas) : undefined,
      observaciones: formData.observaciones || undefined,
      anomalias: formData.anomalias || undefined
    };

    // Según el modo, enviar datos diferentes
    if (modoRegistro === 'por_ordeno') {
      datosParaEnviar = {
        ...datosParaEnviar,
        ordenoManana: formData.ordenoManana ? parseFloat(formData.ordenoManana) : 0,
        ordenoTarde: formData.ordenoTarde ? parseFloat(formData.ordenoTarde) : 0,
        ordenoNoche: formData.ordenoNoche ? parseFloat(formData.ordenoNoche) : 0
      };
    } else {
      // En modo total diario, distribuir equitativamente en ordeño mañana
      const total = parseFloat(formData.totalDiario) || 0;
      datosParaEnviar = {
        ...datosParaEnviar,
        ordenoManana: total,
        ordenoTarde: 0,
        ordenoNoche: 0
      };
    }

    onSubmit(datosParaEnviar);
  };

  const vacasFiltradas = vacasDisponibles.filter(vaca =>
    vaca.numeroIdentificacion.toLowerCase().includes(busquedaVaca.toLowerCase()) ||
    (vaca.nombre && vaca.nombre.toLowerCase().includes(busquedaVaca.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {datosIniciales.vacaId ? 'Editar Registro' : 'Nuevo Registro de Producción'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registra la producción lechera diaria
          </p>
        </div>
        {totalCalculado > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Total del día</p>
            <p className="text-3xl font-bold text-blue-600">{totalCalculado.toFixed(1)} L</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Vaca y Fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vaca */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaca *
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
              placeholder="Buscar vaca..."
              required
            />
            {mostrarVacas && vacasFiltradas.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {vacasFiltradas.map((vaca) => (
                  <div
                    key={vaca._id}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleVacaSeleccionada(vaca)}
                  >
                    <div className="font-medium text-gray-900">{vaca.numeroIdentificacion}</div>
                    {vaca.nombre && <div className="text-sm text-gray-500">{vaca.nombre}</div>}
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

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
        </div>

        {/* Selector de Modo de Registro */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Modo de Registro
          </h3>
          
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setModoRegistro('por_ordeno')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                modoRegistro === 'por_ordeno'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Por Ordeño
            </button>
            <button
              type="button"
              onClick={() => setModoRegistro('total_diario')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                modoRegistro === 'total_diario'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Total Diario
            </button>
          </div>

          {/* Campos según el modo */}
          {modoRegistro === 'por_ordeno' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌅 Ordeño Mañana
                </label>
                <input
                  type="number"
                  name="ordenoManana"
                  value={formData.ordenoManana}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ☀️ Ordeño Tarde
                </label>
                <input
                  type="number"
                  name="ordenoTarde"
                  value={formData.ordenoTarde}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌙 Ordeño Noche
                </label>
                <input
                  type="number"
                  name="ordenoNoche"
                  value={formData.ordenoNoche}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="0.0"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Total de Litros del Día
              </label>
              <input
                type="number"
                name="totalDiario"
                value={formData.totalDiario}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg font-semibold"
                placeholder="Ej: 25.5"
              />
              <p className="text-sm text-gray-600 mt-2">
                Ingresa el total de litros producidos en todo el día
              </p>
            </div>
          )}
        </div>

        {/* Calidad de Leche (Opcional) */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Calidad de Leche (Opcional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grasa (%)
              </label>
              <input
                type="number"
                name="grasa"
                value={formData.grasa}
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
                Proteína (%)
              </label>
              <input
                type="number"
                name="proteina"
                value={formData.proteina}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 3.2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Células Somáticas (células/ml)
              </label>
              <input
                type="number"
                name="celulasSomaticas"
                value={formData.celulasSomaticas}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 200000"
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Observaciones generales..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anomalías
            </label>
            <textarea
              name="anomalias"
              value={formData.anomalias}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Mastitis, sangre, etc..."
            />
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
            disabled={isLoading || !formData.vacaId || totalCalculado === 0}
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
            ) : datosIniciales.vacaId ? 'Actualizar Registro' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioProduccionLechera;

