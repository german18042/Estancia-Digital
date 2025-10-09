'use client';

import React, { useState, useEffect } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  sexo: string;
}

interface FormularioGestacionProps {
  onSubmit: (datosGestacion: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  vacasDisponibles?: Vaca[];
}

const FormularioGestacion: React.FC<FormularioGestacionProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  vacasDisponibles = []
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

    // Confirmación
    fechaConfirmacion: datosIniciales.fechaConfirmacion 
      ? new Date(datosIniciales.fechaConfirmacion).toISOString().split('T')[0] 
      : '',
    diasGestacionConfirmados: datosIniciales.diasGestacionConfirmados || '',
    metodoConfirmacion: datosIniciales.metodoConfirmacion || '',
    confirmadoPor: datosIniciales.confirmadoPor || '',

    // Seguimiento
    pesoInicial: datosIniciales.pesoInicial || '',
    pesoActual: datosIniciales.pesoActual || '',

    // Cuidados especiales
    dietaEspecial: datosIniciales.dietaEspecial || '',
    medicamentos: Array.isArray(datosIniciales.medicamentos) 
      ? datosIniciales.medicamentos.join(', ') 
      : (datosIniciales.medicamentos || ''),
    restricciones: Array.isArray(datosIniciales.restricciones) 
      ? datosIniciales.restricciones.join(', ') 
      : (datosIniciales.restricciones || ''),
    ejercicioRecomendado: datosIniciales.ejercicioRecomendado || '',

    // Estado
    estado: datosIniciales.estado || 'en_gestacion'
  });

  const [mostrarVacas, setMostrarVacas] = useState(false);
  const [busquedaVaca, setBusquedaVaca] = useState('');

  // Actualizar el formulario cuando cambien los datosIniciales (para edición)
  useEffect(() => {
    if (datosIniciales && Object.keys(datosIniciales).length > 0) {
      setFormData({
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

        // Confirmación
        fechaConfirmacion: datosIniciales.fechaConfirmacion 
          ? new Date(datosIniciales.fechaConfirmacion).toISOString().split('T')[0] 
          : '',
        diasGestacionConfirmados: datosIniciales.diasGestacionConfirmados || '',
        metodoConfirmacion: datosIniciales.metodoConfirmacion || '',
        confirmadoPor: datosIniciales.confirmadoPor || '',

        // Seguimiento
        pesoInicial: datosIniciales.pesoInicial || '',
        pesoActual: datosIniciales.pesoActual || '',

        // Cuidados especiales
        dietaEspecial: datosIniciales.dietaEspecial || '',
        medicamentos: Array.isArray(datosIniciales.medicamentos) 
          ? datosIniciales.medicamentos.join(', ') 
          : (datosIniciales.medicamentos || ''),
        restricciones: Array.isArray(datosIniciales.restricciones) 
          ? datosIniciales.restricciones.join(', ') 
          : (datosIniciales.restricciones || ''),
        ejercicioRecomendado: datosIniciales.ejercicioRecomendado || '',

        // Estado
        estado: datosIniciales.estado || 'en_gestacion'
      });
      
      // Actualizar la búsqueda de vaca si existe
      if (datosIniciales.numeroIdentificacionVaca) {
        setBusquedaVaca(datosIniciales.numeroIdentificacionVaca);
      }
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
    
    // Convertir campos numéricos y manejar campos vacíos
    const datosParaEnviar = {
      ...formData,
      pesoInicial: formData.pesoInicial ? parseFloat(String(formData.pesoInicial)) : undefined,
      pesoActual: formData.pesoActual ? parseFloat(String(formData.pesoActual)) : undefined,
      diasGestacionConfirmados: formData.diasGestacionConfirmados ? parseInt(String(formData.diasGestacionConfirmados)) : undefined,
      fechaServicio: formData.fechaServicio ? new Date(formData.fechaServicio) : undefined,
      fechaConfirmacion: formData.fechaConfirmacion ? new Date(formData.fechaConfirmacion) : undefined,
      metodoConfirmacion: formData.metodoConfirmacion || undefined, // Convertir string vacío a undefined
      confirmadoPor: formData.confirmadoPor || undefined, // Convertir string vacío a undefined
      medicamentos: formData.medicamentos 
        ? (typeof formData.medicamentos === 'string' 
          ? formData.medicamentos.split(',').map((m: string) => m.trim()) 
          : formData.medicamentos)
        : [],
      restricciones: formData.restricciones 
        ? (typeof formData.restricciones === 'string' 
          ? formData.restricciones.split(',').map((r: string) => r.trim()) 
          : formData.restricciones)
        : []
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {datosIniciales.vacaId ? 'Editar Gestación' : 'Registrar Nueva Gestación'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selección de Vaca */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Información de la Vaca</h3>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Vaca *
            </label>
            <input
              type="text"
              value={busquedaVaca}
              onChange={(e) => {
                setBusquedaVaca(e.target.value);
                setMostrarVacas(true);
              }}
              onFocus={() => setMostrarVacas(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Buscar vaca por número de ID o nombre"
            />
            {mostrarVacas && vacasFiltradas.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {vacasFiltradas.map((vaca) => (
                  <div
                    key={vaca._id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
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
          </div>
        </div>

        {/* Información del Servicio */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Información del Servicio</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // Limpiar campos de confirmación para registrar solo servicio
                  setFormData(prev => ({
                    ...prev,
                    fechaConfirmacion: '',
                    diasGestacionConfirmados: '',
                    metodoConfirmacion: '',
                    confirmadoPor: ''
                  }));
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                title="Limpiar campos de confirmación para registrar solo el servicio"
              >
                📝 Solo Servicio
              </button>
            </div>
          </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Fecha aproximada del servicio"
              />
              <p className="text-sm text-gray-500 mt-1">
                Opcional - Solo si conoces la fecha exacta del servicio
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
                placeholder="ID del toro o nombre"
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
                placeholder="Detalles del semen usado"
              />
            </div>
          </div>
        </div>

        {/* Confirmación de Gestación */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Confirmación de Gestación</h3>
            <span className="text-sm text-gray-500 bg-yellow-100 px-2 py-1 rounded">
              Opcional - Puedes registrar solo el servicio
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Confirmación
              </label>
              <input
                type="date"
                name="fechaConfirmacion"
                value={formData.fechaConfirmacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días de Gestación Confirmados
              </label>
              <input
                type="number"
                name="diasGestacionConfirmados"
                value={formData.diasGestacionConfirmados}
                onChange={handleChange}
                min="1"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 45, 60, 90"
              />
              <p className="text-sm text-gray-500 mt-1">
                Días de gestación según el diagnóstico del veterinario
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Confirmación
              </label>
              <select
                name="metodoConfirmacion"
                value={formData.metodoConfirmacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Seleccionar método</option>
                <option value="palpacion">Palpación</option>
                <option value="ecografia">Ecografía</option>
                <option value="analisis_sangre">Análisis de Sangre</option>
                <option value="observacion_comportamiento">Observación de Comportamiento</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmado Por
              </label>
              <input
                type="text"
                name="confirmadoPor"
                value={formData.confirmadoPor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Nombre del veterinario"
              />
            </div>
          </div>
        </div>

        {/* Seguimiento */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Seguimiento</h3>
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
            </div>
          </div>
        </div>

        {/* Cuidados Especiales */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Cuidados Especiales</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dieta Especial
              </label>
              <textarea
                name="dietaEspecial"
                value={formData.dietaEspecial}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Descripción de la dieta especial"
              />
            </div>
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
                placeholder="Separar con comas: Vitamina E, Minerales"
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
                placeholder="Separar con comas: No ejercicio intenso, Evitar estrés"
              />
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

        {/* Estado */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Estado Actual</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="en_gestacion">En Gestación</option>
              <option value="parto_exitoso">Parto Exitoso</option>
              <option value="aborto">Aborto</option>
              <option value="parto_dificil">Parto Difícil</option>
              <option value="complicaciones">Complicaciones</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          
          {/* Botón para registrar solo servicio */}
          {!datosIniciales.vacaId && (
            <button
              type="button"
              onClick={() => {
                // Limpiar campos de confirmación y enviar solo servicio
                const datosServicio = {
                  ...formData,
                  pesoInicial: formData.pesoInicial ? parseFloat(String(formData.pesoInicial)) : undefined,
                  pesoActual: formData.pesoActual ? parseFloat(String(formData.pesoActual)) : undefined,
                  diasGestacionConfirmados: undefined,
                  fechaServicio: formData.fechaServicio ? new Date(formData.fechaServicio) : undefined,
                  fechaConfirmacion: undefined,
                  metodoConfirmacion: undefined, // Asegurar que sea undefined, no string vacío
                  confirmadoPor: undefined, // Asegurar que sea undefined, no string vacío
                  medicamentos: formData.medicamentos 
                    ? (typeof formData.medicamentos === 'string' 
                      ? formData.medicamentos.split(',').map((m: string) => m.trim())
                      : formData.medicamentos)
                    : [],
                  restricciones: formData.restricciones 
                    ? (typeof formData.restricciones === 'string' 
                      ? formData.restricciones.split(',').map((r: string) => r.trim())
                      : formData.restricciones)
                    : []
                };
                onSubmit(datosServicio);
              }}
              disabled={isLoading || !formData.vacaId || !formData.tipoServicio}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : '📝 Solo Servicio'}
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : (datosIniciales.vacaId ? 'Actualizar' : 'Registrar Completo')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioGestacion;
