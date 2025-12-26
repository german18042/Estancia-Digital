'use client';

import React, { useState, useEffect } from 'react';

interface ModalDetalleLoteProps {
  loteId: string;
  nombreLote: string;
  colorLote: string;
  onClose: () => void;
}

const ModalDetalleLote: React.FC<ModalDetalleLoteProps> = ({
  loteId,
  nombreLote,
  colorLote,
  onClose
}) => {
  const [vacas, setVacas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarVacas();
  }, [loteId]);

  const cargarVacas = async () => {
    try {
      const response = await fetch(`/api/lotes/${loteId}`);
      if (response.ok) {
        const data = await response.json();
        setVacas(data.vacas || []);
      }
    } catch (error) {
      console.error('Error al cargar vacas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      vacia: 'bg-gray-100 text-gray-800',
      gestante: 'bg-green-100 text-green-800',
      lactante: 'bg-blue-100 text-blue-800',
      secado: 'bg-yellow-100 text-yellow-800',
      no_apta: 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: colorLote }}>
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{nombreLote}</h2>
              <p className="text-sm opacity-90 mt-1">
                {vacas.length} vaca(s) en este lote
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : vacas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="font-medium">No hay vacas en este lote</p>
              <p className="text-sm mt-2">Asigna vacas a este lote desde el registro de vacas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vacas.map((vaca) => (
                <div
                  key={vaca._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {vaca.numeroIdentificacion}
                      </p>
                      {vaca.nombre && (
                        <p className="text-sm text-gray-600">{vaca.nombre}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(vaca.estadoReproductivo)}`}>
                      {vaca.estadoReproductivo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleLote;

