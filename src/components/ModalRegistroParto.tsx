'use client';

import React, { useState } from 'react';

interface Cria {
  numeroIdentificacion: string;
  sexo: 'macho' | 'hembra';
  pesoNacimiento: number;
  observaciones?: string;
}

interface ModalRegistroPartoProps {
  gestacion: {
    _id: string;
    numeroIdentificacionVaca: string;
    nombreVaca?: string;
  };
  onClose: () => void;
  onRegistrar: (datos: {
    resultado: 'parto' | 'aborto';
    fechaPartoReal?: Date;
    tipoParto?: 'natural' | 'cesarea' | 'inducido' | 'asistido';
    complicacionesParto?: string;
    crias?: Cria[];
  }) => Promise<void>;
  errorExterno?: string | null;
}

const ModalRegistroParto: React.FC<ModalRegistroPartoProps> = ({
  gestacion,
  onClose,
  onRegistrar,
  errorExterno
}) => {
  const [resultado, setResultado] = useState<'parto' | 'aborto' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fechaParto, setFechaParto] = useState(new Date().toISOString().split('T')[0]);
  const [tipoParto, setTipoParto] = useState<'natural' | 'cesarea' | 'inducido' | 'asistido'>('natural');
  const [complicaciones, setComplicaciones] = useState('');
  const [crias, setCrias] = useState<Cria[]>([{
    numeroIdentificacion: '',
    sexo: 'hembra',
    pesoNacimiento: 0,
    observaciones: ''
  }]);

  const handleAgregarCria = () => {
    setCrias([...crias, {
      numeroIdentificacion: '',
      sexo: 'hembra',
      pesoNacimiento: 0,
      observaciones: ''
    }]);
  };

  const handleEliminarCria = (index: number) => {
    setCrias(crias.filter((_, i) => i !== index));
  };

  const handleCriaChange = (index: number, field: keyof Cria, value: any) => {
    const nuevasCrias = [...crias];
    nuevasCrias[index] = { ...nuevasCrias[index], [field]: value };
    setCrias(nuevasCrias);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resultado) {
      alert('Por favor selecciona el resultado');
      return;
    }

    if (resultado === 'parto') {
      // Validar que al menos haya una cría con número de identificación
      if (crias.length === 0 || !crias[0].numeroIdentificacion) {
        alert('Por favor registra al menos una cría');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      if (resultado === 'parto') {
        await onRegistrar({
          resultado,
          fechaPartoReal: new Date(fechaParto),
          tipoParto,
          complicacionesParto: complicaciones || undefined,
          crias: crias.map(c => ({
            ...c,
            pesoNacimiento: parseFloat(String(c.pesoNacimiento))
          }))
        });
      } else {
        // Aborto
        await onRegistrar({
          resultado,
          fechaPartoReal: new Date(fechaParto),
          complicacionesParto: complicaciones || undefined
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Registrar Resultado de Gestación</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Vaca: <span className="font-semibold">{gestacion.numeroIdentificacionVaca}</span>
            {gestacion.nombreVaca && ` (${gestacion.nombreVaca})`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mostrar error si existe */}
          {errorExterno && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 shadow-lg animate-pulse">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-base font-bold text-red-900 mb-2">⚠️ Error al Registrar</h3>
                  <div className="text-sm text-red-800 font-medium bg-white px-3 py-2 rounded border border-red-300">
                    {errorExterno}
                  </div>
                  <p className="text-xs text-red-700 mt-2 italic">
                    Por favor corrige el error e intenta nuevamente
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selección de resultado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Resultado de la Gestación *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setResultado('parto')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                  resultado === 'parto'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700'
                } font-semibold hover:border-green-400`}
              >
                🐄 Parto Exitoso
              </button>
              <button
                type="button"
                onClick={() => setResultado('aborto')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                  resultado === 'aborto'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700'
                } font-semibold hover:border-red-400`}
              >
                ⚠️ Aborto
              </button>
            </div>
          </div>

          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Real del {resultado === 'aborto' ? 'Aborto' : 'Parto'} *
              </label>
              <input
                type="date"
                value={fechaParto}
                onChange={(e) => setFechaParto(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {resultado === 'parto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Parto *
                </label>
                <select
                  value={tipoParto}
                  onChange={(e) => setTipoParto(e.target.value as 'natural' | 'cesarea' | 'inducido' | 'asistido')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="natural">Natural (Normal)</option>
                  <option value="cesarea">Cesárea</option>
                  <option value="inducido">Parto Asistido</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complicaciones / Observaciones
            </label>
            <textarea
              value={complicaciones}
              onChange={(e) => setComplicaciones(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Describe cualquier complicación o detalle importante..."
            />
          </div>

          {/* Registro de crías si es parto exitoso */}
          {resultado === 'parto' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Registro de Crías</h3>
                <button
                  type="button"
                  onClick={handleAgregarCria}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  + Agregar Cría
                </button>
              </div>

              {crias.map((cria, index) => (
                <div key={index} className="bg-white p-4 rounded-lg mb-3 border border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Cría #{index + 1}</h4>
                    {crias.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarCria(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Identificación *
                      </label>
                      <input
                        type="text"
                        value={cria.numeroIdentificacion}
                        onChange={(e) => handleCriaChange(index, 'numeroIdentificacion', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Ej: 12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sexo *
                      </label>
                      <select
                        value={cria.sexo}
                        onChange={(e) => handleCriaChange(index, 'sexo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="hembra">Hembra</option>
                        <option value="macho">Macho</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peso al Nacer (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={cria.pesoNacimiento}
                        onChange={(e) => handleCriaChange(index, 'pesoNacimiento', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Ej: 35.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                      </label>
                      <input
                        type="text"
                        value={cria.observaciones}
                        onChange={(e) => handleCriaChange(index, 'observaciones', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Estado de salud, color, etc."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!resultado || isSubmitting}
              className={`px-6 py-2 rounded-md text-white ${
                resultado === 'parto'
                  ? 'bg-green-600 hover:bg-green-700'
                  : resultado === 'aborto'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-400 cursor-not-allowed'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isSubmitting 
                ? 'Registrando...' 
                : resultado === 'parto' 
                ? 'Registrar Parto y Crías' 
                : resultado === 'aborto' 
                ? 'Registrar Aborto' 
                : 'Selecciona un resultado'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalRegistroParto;

