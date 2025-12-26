'use client';

import React, { useState, useEffect } from 'react';
import FormularioLote from './FormularioLote';
import ListaLotes from './ListaLotes';
import ModalDetalleLote from './ModalDetalleLote';

interface Lote {
  _id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  tipoLote: string;
  capacidadMaxima?: number;
  ubicacionPrincipal?: string;
  activo: boolean;
  numeroVacas?: number;
}

const ConfiguracionApp: React.FC = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loteEditando, setLoteEditando] = useState<Lote | null>(null);
  const [loteDetalle, setLoteDetalle] = useState<Lote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    cargarLotes();
  }, []);

  const cargarLotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/lotes?estadisticas=true');
      if (!response.ok) throw new Error('Error al cargar lotes');
      
      const data = await response.json();
      setLotes(data.lotes || []);
    } catch (err) {
      setError('Error al cargar los lotes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (datos: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const url = loteEditando 
        ? `/api/lotes/${loteEditando._id}`
        : '/api/lotes';
      
      const response = await fetch(url, {
        method: loteEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      setSuccessMessage(loteEditando ? 'Lote actualizado' : 'Lote creado');
      setMostrarFormulario(false);
      setLoteEditando(null);
      await cargarLotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lotes/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar');
      }

      setSuccessMessage('Lote eliminado');
      await cargarLotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ⚙️ Configuración de Lotes
          </h1>
          <p className="text-gray-600">
            Crea y administra grupos de vacas para un mejor manejo
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Información Útil */}
        {!mostrarFormulario && lotes.length === 0 && !isLoading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ¿Qué son los lotes?
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✅ <strong>Organiza vacas</strong> en grupos lógicos (Producción, Gestación, etc.)</li>
                  <li>✅ <strong>Aplica tratamientos</strong> a todo un grupo de una sola vez</li>
                  <li>✅ <strong>Facilita el manejo</strong> diario de tu ganadería</li>
                  <li>✅ <strong>Analiza por grupos</strong> el rendimiento de tu operación</li>
                </ul>
                <p className="mt-3 text-sm text-blue-700">
                  💡 <strong>Ejemplo:</strong> Crea un lote &quot;Alta Producción&quot; y asigna tus mejores vacas. Luego podrás vacunarlas todas en un solo paso.
                </p>
              </div>
            </div>
          </div>
        )}

        {mostrarFormulario ? (
          <FormularioLote
            onSubmit={handleSubmit}
            isLoading={isLoading}
            datosIniciales={loteEditando || {}}
            onCancelar={() => {
              setMostrarFormulario(false);
              setLoteEditando(null);
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Mis Lotes
              </h2>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Nuevo Lote
              </button>
            </div>

            <ListaLotes
              lotes={lotes}
              onEditar={(lote) => {
                setLoteEditando(lote);
                setMostrarFormulario(true);
              }}
              onEliminar={handleEliminar}
              onVerDetalle={setLoteDetalle}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {loteDetalle && (
        <ModalDetalleLote
          loteId={loteDetalle._id}
          nombreLote={loteDetalle.nombre}
          colorLote={loteDetalle.color}
          onClose={() => setLoteDetalle(null)}
        />
      )}
    </div>
  );
};

export default ConfiguracionApp;

