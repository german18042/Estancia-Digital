'use client';

import React, { useState, useEffect } from 'react';

interface FormularioUbicacionProps {
  onSubmit: (datos: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
}

const FormularioUbicacion: React.FC<FormularioUbicacionProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {}
}) => {
  const [formData, setFormData] = useState({
    nombre: datosIniciales.nombre || '',
    tipo: datosIniciales.tipo || 'potrero',
    capacidad: datosIniciales.capacidad || '',
    area: datosIniciales.area || '',
    descripcion: datosIniciales.descripcion || '',
    caracteristicas: datosIniciales.caracteristicas?.join(', ') || '',
    estado: datosIniciales.estado || 'activa'
  });

  useEffect(() => {
    if (datosIniciales && Object.keys(datosIniciales).length > 0) {
      setFormData({
        nombre: datosIniciales.nombre || '',
        tipo: datosIniciales.tipo || 'potrero',
        capacidad: datosIniciales.capacidad || '',
        area: datosIniciales.area || '',
        descripcion: datosIniciales.descripcion || '',
        caracteristicas: datosIniciales.caracteristicas?.join(', ') || '',
        estado: datosIniciales.estado || 'activa'
      });
    }
  }, [datosIniciales]);

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
      ...formData,
      capacidad: formData.capacidad ? parseInt(String(formData.capacidad)) : undefined,
      area: formData.area ? parseFloat(String(formData.area)) : undefined,
      caracteristicas: formData.caracteristicas 
        ? formData.caracteristicas.split(',').map((c: string) => c.trim()).filter((c: string) => c) 
        : []
    };

    onSubmit(datosParaEnviar);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        {datosIniciales._id ? 'Editar Ubicación' : 'Nueva Ubicación'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Ubicación *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Potrero Norte"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="potrero">Potrero</option>
            <option value="corral">Corral</option>
            <option value="establo">Establo</option>
            <option value="area_especial">Área Especial</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Capacidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacidad (animales)
          </label>
          <input
            type="number"
            name="capacidad"
            value={formData.capacidad}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Número máximo de animales"
          />
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área (hectáreas o m²)
          </label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Tamaño del área"
          />
        </div>

        {/* Estado */}
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
            <option value="activa">Activa</option>
            <option value="mantenimiento">En Mantenimiento</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </div>

        {/* Características */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Características (separadas por comas)
          </label>
          <input
            type="text"
            name="caracteristicas"
            value={formData.caracteristicas}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Sombra, Agua, Comedero, Bebedero"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Detalles adicionales sobre la ubicación..."
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : datosIniciales._id ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default FormularioUbicacion;

