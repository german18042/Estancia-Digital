'use client';

import React, { useState } from 'react';

interface FormularioLoteProps {
  onSubmit: (datos: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  onCancelar?: () => void;
}

const FormularioLote: React.FC<FormularioLoteProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  onCancelar
}) => {
  const [formData, setFormData] = useState({
    nombre: datosIniciales.nombre || '',
    descripcion: datosIniciales.descripcion || '',
    color: datosIniciales.color || '#3B82F6',
    tipoLote: datosIniciales.tipoLote || 'otro',
    capacidadMaxima: datosIniciales.capacidadMaxima || '',
    ubicacionPrincipal: datosIniciales.ubicacionPrincipal || '',
    dietaEspecial: datosIniciales.dietaEspecial || '',
    protocoloManejo: datosIniciales.protocoloManejo || '',
    activo: datosIniciales.activo !== undefined ? datosIniciales.activo : true
  });

  const coloresDisponibles = [
    { nombre: 'Azul', valor: '#3B82F6' },
    { nombre: 'Verde', valor: '#10B981' },
    { nombre: 'Rojo', valor: '#EF4444' },
    { nombre: 'Amarillo', valor: '#F59E0B' },
    { nombre: 'Morado', valor: '#8B5CF6' },
    { nombre: 'Rosa', valor: '#EC4899' },
    { nombre: 'Índigo', valor: '#6366F1' },
    { nombre: 'Gris', valor: '#6B7280' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const datosParaEnviar = {
      ...formData,
      capacidadMaxima: formData.capacidadMaxima ? parseInt(formData.capacidadMaxima) : undefined,
      ubicacionPrincipal: formData.ubicacionPrincipal || undefined,
      dietaEspecial: formData.dietaEspecial || undefined,
      protocoloManejo: formData.protocoloManejo || undefined
    };

    onSubmit(datosParaEnviar);
  };

  const getTipoIcon = (tipo: string) => {
    const iconos: { [key: string]: string } = {
      produccion: '🥛',
      gestacion: '🤰',
      novillas: '🐮',
      secas: '🛑',
      enfermeria: '🏥',
      venta: '💰',
      otro: '📋'
    };
    return iconos[tipo] || '📋';
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {datosIniciales._id ? 'Editar Lote' : 'Crear Nuevo Lote'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Organiza tus vacas en grupos para un mejor manejo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre y Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Lote *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
              placeholder="Ej: Lote A, Producción 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Lote
            </label>
            <select
              name="tipoLote"
              value={formData.tipoLote}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="produccion">{getTipoIcon('produccion')} Producción</option>
              <option value="gestacion">{getTipoIcon('gestacion')} Gestación</option>
              <option value="novillas">{getTipoIcon('novillas')} Novillas</option>
              <option value="secas">{getTipoIcon('secas')} Secas</option>
              <option value="enfermeria">{getTipoIcon('enfermeria')} Enfermería</option>
              <option value="venta">{getTipoIcon('venta')} Para Venta</option>
              <option value="otro">{getTipoIcon('otro')} Otro</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Descripción del lote o grupo..."
          />
        </div>

        {/* Color y Capacidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Identificación
            </label>
            <div className="grid grid-cols-4 gap-2">
              {coloresDisponibles.map((color) => (
                <button
                  key={color.valor}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.valor }))}
                  className={`h-12 rounded-md border-2 transition-all ${
                    formData.color === color.valor
                      ? 'border-gray-800 shadow-lg scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.valor }}
                  title={color.nombre}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Color seleccionado: <span className="font-semibold">{coloresDisponibles.find(c => c.valor === formData.color)?.nombre}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad Máxima
            </label>
            <input
              type="number"
              name="capacidadMaxima"
              value={formData.capacidadMaxima}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Número máximo de vacas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional - Límite de vacas en este lote
            </p>
          </div>
        </div>

        {/* Ubicación Principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación Principal
          </label>
          <input
            type="text"
            name="ubicacionPrincipal"
            value={formData.ubicacionPrincipal}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Potrero Norte, Establo 2"
          />
        </div>

        {/* Manejo Especial */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Manejo Especial (Opcional)</h3>
          
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
                placeholder="Descripción de la dieta para este lote..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protocolo de Manejo
              </label>
              <textarea
                name="protocoloManejo"
                value={formData.protocoloManejo}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Instrucciones especiales de manejo..."
              />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Lote activo
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
            disabled={isLoading || !formData.nombre}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Guardando...' : datosIniciales._id ? 'Actualizar Lote' : 'Crear Lote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioLote;

