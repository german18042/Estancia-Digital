'use client';

import React, { useState, useEffect } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  lote?: string;
}

interface FormularioRegistroSanitarioProps {
  onSubmit: (datos: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  vacasDisponibles?: Vaca[];
  onCancelar?: () => void;
}

const FormularioRegistroSanitario: React.FC<FormularioRegistroSanitarioProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  vacasDisponibles = [],
  onCancelar
}) => {
  const [modoSeleccion, setModoSeleccion] = useState<'individual' | 'lote'>('individual');
  const [loteSeleccionado, setLoteSeleccionado] = useState('');
  const [vacasDelLote, setVacasDelLote] = useState<Vaca[]>([]);
  
  const [formData, setFormData] = useState({
    vacaId: datosIniciales.vacaId || '',
    numeroIdentificacionVaca: datosIniciales.numeroIdentificacionVaca || '',
    nombreVaca: datosIniciales.nombreVaca || '',
    aplicarALote: false,
    tipo: datosIniciales.tipo || 'vacuna',
    fecha: datosIniciales.fecha 
      ? new Date(datosIniciales.fecha).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    nombre: datosIniciales.nombre || '',
    descripcion: datosIniciales.descripcion || '',
    diagnostico: datosIniciales.diagnostico || '',
    producto: datosIniciales.producto || '',
    dosis: datosIniciales.dosis || '',
    viaAdministracion: datosIniciales.viaAdministracion || '',
    lote: datosIniciales.lote || '',
    veterinario: datosIniciales.veterinario || '',
    proximaFecha: datosIniciales.proximaFecha 
      ? new Date(datosIniciales.proximaFecha).toISOString().split('T')[0]
      : '',
    diasRetiro: datosIniciales.diasRetiro || '',
    costo: datosIniciales.costo || '',
    resultado: datosIniciales.resultado || '',
    observaciones: datosIniciales.observaciones || '',
    efectosSecundarios: datosIniciales.efectosSecundarios || '',
    completado: datosIniciales.completado !== undefined ? datosIniciales.completado : true
  });

  const [mostrarVacas, setMostrarVacas] = useState(false);
  const [busquedaVaca, setBusquedaVaca] = useState('');

  useEffect(() => {
    if (datosIniciales.numeroIdentificacionVaca) {
      setBusquedaVaca(datosIniciales.numeroIdentificacionVaca);
    }
  }, [datosIniciales]);

  // Actualizar vacas del lote cuando cambie la selección
  useEffect(() => {
    if (modoSeleccion === 'lote' && loteSeleccionado) {
      const vacas = vacasDisponibles.filter(v => v.lote === loteSeleccionado);
      setVacasDelLote(vacas);
    } else {
      setVacasDelLote([]);
    }
  }, [modoSeleccion, loteSeleccionado, vacasDisponibles]);

  // Obtener lista de lotes únicos
  const lotesDisponibles = Array.from(
    new Set(vacasDisponibles.filter(v => v.lote).map(v => v.lote))
  ).sort();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    
    const datosBase = {
      tipo: formData.tipo,
      fecha: new Date(formData.fecha),
      nombre: formData.nombre,
      proximaFecha: formData.proximaFecha ? new Date(formData.proximaFecha) : undefined,
      diasRetiro: formData.diasRetiro ? parseInt(formData.diasRetiro) : undefined,
      costo: formData.costo ? parseFloat(formData.costo) : undefined,
      viaAdministracion: formData.viaAdministracion || undefined,
      producto: formData.producto || undefined,
      dosis: formData.dosis || undefined,
      lote: formData.lote || undefined,
      veterinario: formData.veterinario || undefined,
      diagnostico: formData.diagnostico || undefined,
      descripcion: formData.descripcion || undefined,
      resultado: formData.resultado || undefined,
      observaciones: formData.observaciones || undefined,
      efectosSecundarios: formData.efectosSecundarios || undefined,
      completado: formData.completado
    };

    // Si es por lote, enviar array de registros
    if (modoSeleccion === 'lote' && vacasDelLote.length > 0) {
      const registrosLote = vacasDelLote.map(vaca => ({
        ...datosBase,
        vacaId: vaca._id,
        numeroIdentificacionVaca: vaca.numeroIdentificacion,
        nombreVaca: vaca.nombre || ''
      }));
      
      onSubmit({ registrosLote, esLote: true });
    } else {
      // Registro individual
      const datosParaEnviar = {
        ...datosBase,
        vacaId: formData.vacaId,
        numeroIdentificacionVaca: formData.numeroIdentificacionVaca,
        nombreVaca: formData.nombreVaca,
        esLote: false
      };
      
      onSubmit(datosParaEnviar);
    }
  };

  const vacasFiltradas = vacasDisponibles.filter(vaca =>
    vaca.numeroIdentificacion.toLowerCase().includes(busquedaVaca.toLowerCase()) ||
    (vaca.nombre && vaca.nombre.toLowerCase().includes(busquedaVaca.toLowerCase()))
  );

  const getTipoLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      vacuna: '💉 Vacuna',
      desparasitacion: '🐛 Desparasitación',
      tratamiento: '💊 Tratamiento',
      revision: '🔍 Revisión',
      cirugia: '🏥 Cirugía',
      otro: '📋 Otro'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {datosIniciales.vacaId ? 'Editar Registro' : 'Nuevo Registro Sanitario'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Registra procedimientos veterinarios, vacunas y tratamientos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de Modo: Individual o Lote */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModoSeleccion('individual')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                modoSeleccion === 'individual'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Vaca Individual
            </button>
            <button
              type="button"
              onClick={() => setModoSeleccion('lote')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                modoSeleccion === 'lote'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Lote Completo
            </button>
          </div>
        </div>

        {/* Selección según modo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modoSeleccion === 'individual' ? (
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
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Buscar vaca..."
                required
              />
              {mostrarVacas && vacasFiltradas.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {vacasFiltradas.map((vaca) => (
                    <div
                      key={vaca._id}
                      className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleVacaSeleccionada(vaca)}
                    >
                      <div className="font-medium text-gray-900">{vaca.numeroIdentificacion}</div>
                      {vaca.nombre && <div className="text-sm text-gray-500">{vaca.nombre}</div>}
                      {vaca.lote && <div className="text-xs text-purple-600">Lote: {vaca.lote}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Lote *
              </label>
              <select
                value={loteSeleccionado}
                onChange={(e) => setLoteSeleccionado(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              >
                <option value="">Seleccionar lote...</option>
                {lotesDisponibles.map((lote, index) => {
                  const numVacas = vacasDisponibles.filter(v => v.lote === lote).length;
                  return (
                    <option key={index} value={lote}>
                      {lote} ({numVacas} vaca{numVacas !== 1 ? 's' : ''})
                    </option>
                  );
                })}
              </select>
              {vacasDelLote.length > 0 && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-800 mb-2">
                    Se aplicará a {vacasDelLote.length} vaca(s):
                  </p>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {vacasDelLote.map((vaca, index) => (
                        <span key={index} className="px-2 py-1 bg-white border border-purple-200 rounded text-xs font-medium text-gray-700">
                          {vaca.numeroIdentificacion}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Registro *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            >
              <option value="vacuna">{getTipoLabel('vacuna')}</option>
              <option value="desparasitacion">{getTipoLabel('desparasitacion')}</option>
              <option value="tratamiento">{getTipoLabel('tratamiento')}</option>
              <option value="revision">{getTipoLabel('revision')}</option>
              <option value="cirugia">{getTipoLabel('cirugia')}</option>
              <option value="otro">{getTipoLabel('otro')}</option>
            </select>
          </div>
        </div>

        {/* Fecha y Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha del Procedimiento *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Procedimiento *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Ej: Vacuna contra brucelosis"
            />
          </div>
        </div>

        {/* Producto y Dosis */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del Medicamento/Vacuna</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto
              </label>
              <input
                type="text"
                name="producto"
                value={formData.producto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Nombre comercial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosis
              </label>
              <input
                type="text"
                name="dosis"
                value={formData.dosis}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Ej: 5 ml, 2 comprimidos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vía de Administración
              </label>
              <select
                name="viaAdministracion"
                value={formData.viaAdministracion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              >
                <option value="">Seleccionar...</option>
                <option value="oral">Oral</option>
                <option value="inyectable">Inyectable</option>
                <option value="topica">Tópica</option>
                <option value="otra">Otra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lote
              </label>
              <input
                type="text"
                name="lote"
                value={formData.lote}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                placeholder="Número de lote"
              />
            </div>
          </div>
        </div>

        {/* Seguimiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próxima Fecha (Refuerzo)
            </label>
            <input
              type="date"
              name="proximaFecha"
              value={formData.proximaFecha}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días de Retiro
            </label>
            <input
              type="number"
              name="diasRetiro"
              value={formData.diasRetiro}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Días"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo ($)
            </label>
            <input
              type="number"
              name="costo"
              value={formData.costo}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Veterinario y Diagnóstico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Veterinario
            </label>
            <input
              type="text"
              name="veterinario"
              value={formData.veterinario}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Nombre del veterinario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <input
              type="text"
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Diagnóstico del veterinario"
            />
          </div>
        </div>

        {/* Descripción y Observaciones */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
              placeholder="Descripción del procedimiento"
            />
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
              placeholder="Observaciones adicionales"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="completado"
            checked={formData.completado}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Procedimiento completado
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || (modoSeleccion === 'individual' && !formData.vacaId) || (modoSeleccion === 'lote' && vacasDelLote.length === 0)}
            className={`px-8 py-3 text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium ${
              modoSeleccion === 'lote' ? 'bg-purple-600' : 'bg-green-600'
            }`}
          >
            {isLoading ? 'Guardando...' : 
             datosIniciales.vacaId ? 'Actualizar' : 
             modoSeleccion === 'lote' ? `Aplicar a ${vacasDelLote.length} Vaca(s)` : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioRegistroSanitario;

