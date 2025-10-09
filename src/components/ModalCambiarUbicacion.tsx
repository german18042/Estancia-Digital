'use client';

import React, { useState } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  ubicacionActual: string;
}

interface ModalCambiarUbicacionProps {
  vaca: Vaca;
  onClose: () => void;
  onCambiar: (datos: {
    ubicacionNueva: string;
    motivo: string;
    observaciones?: string;
  }) => Promise<void>;
}

const ModalCambiarUbicacion: React.FC<ModalCambiarUbicacionProps> = ({
  vaca,
  onClose,
  onCambiar
}) => {
  const [ubicacionNueva, setUbicacionNueva] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ubicacionesDisponibles, setUbicacionesDisponibles] = useState<string[]>([]);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(true);

  // Cargar ubicaciones del usuario
  React.useEffect(() => {
    const cargarUbicaciones = async () => {
      try {
        const response = await fetch('/api/ubicaciones');
        if (response.ok) {
          const data = await response.json();
          const nombres = data.ubicaciones
            .filter((u: any) => u.estado === 'activa')
            .map((u: any) => u.nombre);
          setUbicacionesDisponibles(nombres);
        }
      } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
      } finally {
        setCargandoUbicaciones(false);
      }
    };
    cargarUbicaciones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ubicacionNueva.trim() || !motivo.trim()) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    if (ubicacionNueva.trim() === vaca.ubicacionActual) {
      alert('La nueva ubicación es la misma que la actual');
      return;
    }

    setIsSubmitting(true);

    try {
      await onCambiar({
        ubicacionNueva: ubicacionNueva.trim(),
        motivo: motivo.trim(),
        observaciones: observaciones.trim() || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Cambiar Ubicación</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              type="button"
            >
              ×
            </button>
          </div>
          <div className="mt-2">
            <p className="text-gray-600">
              Vaca: <span className="font-semibold">{vaca.numeroIdentificacion}</span>
              {vaca.nombre && ` (${vaca.nombre})`}
            </p>
            <p className="text-gray-600 mt-1">
              Ubicación actual: <span className="font-semibold text-blue-600">{vaca.ubicacionActual}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nueva ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Ubicación *
            </label>
            {cargandoUbicaciones ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500">
                Cargando ubicaciones...
              </div>
            ) : ubicacionesDisponibles.length === 0 ? (
              <div className="space-y-2">
                <div className="w-full px-3 py-2 border border-yellow-300 rounded-md text-yellow-700 bg-yellow-50">
                  No tienes ubicaciones registradas.
                </div>
                <a
                  href="/ubicaciones"
                  target="_blank"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Crear Ubicaciones
                </a>
                <input
                  type="text"
                  placeholder="O escribe el nombre de la ubicación"
                  value={ubicacionNueva}
                  onChange={(e) => setUbicacionNueva(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            ) : (
              <select
                value={ubicacionNueva}
                onChange={(e) => setUbicacionNueva(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Selecciona una ubicación</option>
                {ubicacionesDisponibles.map((ubicacion) => (
                  <option key={ubicacion} value={ubicacion}>
                    {ubicacion}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del Cambio *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 mb-2"
            >
              <option value="">Selecciona un motivo</option>
              <option value="Rotación de pastoreo">Rotación de pastoreo</option>
              <option value="Tratamiento médico">Tratamiento médico</option>
              <option value="Preparación para parto">Preparación para parto</option>
              <option value="Post-parto">Post-parto</option>
              <option value="Destete">Destete</option>
              <option value="Cuarentena">Cuarentena</option>
              <option value="Mejora de condiciones">Mejora de condiciones</option>
              <option value="Separación por edad">Separación por edad</option>
              <option value="Otro motivo">Otro motivo</option>
            </select>

            {motivo === 'Otro motivo' && (
              <input
                type="text"
                placeholder="Especifica el motivo"
                value={motivo === 'Otro motivo' ? '' : motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Detalles adicionales sobre el cambio de ubicación..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Cambiando...' : (
                <>
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cambiar Ubicación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCambiarUbicacion;

