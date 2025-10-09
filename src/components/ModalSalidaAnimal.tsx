'use client';

import React, { useState } from 'react';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
}

interface ModalSalidaAnimalProps {
  vaca: Vaca;
  onClose: () => void;
  onConfirmar: (datos: {
    tipo: 'vendido' | 'fallecido';
    fecha: Date;
    motivo?: string;
    observaciones?: string;
    // Datos de venta
    comprador?: string;
    precio?: number;
    metodoPago?: string;
    // Datos de muerte
    causaMuerte?: string;
    diagnostico?: string;
  }) => Promise<void>;
}

const ModalSalidaAnimal: React.FC<ModalSalidaAnimalProps> = ({
  vaca,
  onClose,
  onConfirmar
}) => {
  const [tipoSalida, setTipoSalida] = useState<'vendido' | 'fallecido' | null>(null);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    motivo: '',
    observaciones: '',
    // Venta
    comprador: '',
    precio: '',
    metodoPago: '',
    // Muerte
    causaMuerte: '',
    diagnostico: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onConfirmar({
        tipo: tipoSalida!,
        fecha: new Date(formData.fecha),
        motivo: formData.motivo || undefined,
        observaciones: formData.observaciones || undefined,
        comprador: formData.comprador || undefined,
        precio: formData.precio ? parseFloat(formData.precio) : undefined,
        metodoPago: formData.metodoPago || undefined,
        causaMuerte: formData.causaMuerte || undefined,
        diagnostico: formData.diagnostico || undefined
      });
    } catch (error) {
      console.error('Error al registrar salida:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Registrar Salida del Animal
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Información del animal */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Animal</h3>
            <p className="text-blue-800">
              <strong>Número:</strong> {vaca.numeroIdentificacion}
              {vaca.nombre && ` - ${vaca.nombre}`}
            </p>
          </div>

          {!tipoSalida ? (
            /* Selección de tipo */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Seleccione el motivo de salida:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setTipoSalida('vendido')}
                  className="p-6 border-2 border-green-300 rounded-lg hover:bg-green-50 hover:border-green-500 transition-colors"
                >
                  <svg className="w-12 h-12 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div className="text-xl font-semibold text-gray-800">Vendido</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Registrar venta del animal
                  </div>
                </button>
                <button
                  onClick={() => setTipoSalida('fallecido')}
                  className="p-6 border-2 border-red-300 rounded-lg hover:bg-red-50 hover:border-red-500 transition-colors"
                >
                  <svg className="w-12 h-12 mx-auto mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-xl font-semibold text-gray-800">Fallecido</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Registrar muerte del animal
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Formulario según tipo */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos comunes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {tipoSalida === 'vendido' ? (
                /* Campos de venta */
                <>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Información de Venta
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comprador *
                        </label>
                        <input
                          type="text"
                          value={formData.comprador}
                          onChange={(e) => setFormData({ ...formData, comprador: e.target.value })}
                          required
                          placeholder="Nombre del comprador"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio de Venta *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            required
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Método de Pago
                          </label>
                          <select
                            value={formData.metodoPago}
                            onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                          >
                            <option value="">Seleccionar...</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="cheque">Cheque</option>
                            <option value="credito">Crédito</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motivo de la Venta
                        </label>
                        <textarea
                          value={formData.motivo}
                          onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                          rows={2}
                          placeholder="Ej: Bajo rendimiento, edad avanzada, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Campos de muerte */
                <>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Información de Fallecimiento
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Causa de Muerte *
                        </label>
                        <select
                          value={formData.causaMuerte}
                          onChange={(e) => setFormData({ ...formData, causaMuerte: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="enfermedad">Enfermedad</option>
                          <option value="accidente">Accidente</option>
                          <option value="parto">Complicación de Parto</option>
                          <option value="edad">Edad Avanzada</option>
                          <option value="desconocida">Desconocida</option>
                          <option value="otra">Otra</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diagnóstico Veterinario
                        </label>
                        <textarea
                          value={formData.diagnostico}
                          onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                          rows={3}
                          placeholder="Diagnóstico detallado o hallazgos veterinarios..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Observaciones generales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Adicionales
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  placeholder="Información adicional relevante..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setTipoSalida(null)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md text-white ${
                    tipoSalida === 'vendido'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {isLoading ? 'Guardando...' : 'Confirmar y Registrar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalSalidaAnimal;

