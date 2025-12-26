'use client';

import React, { useState, useEffect } from 'react';
import FormularioRegistroSanitario from './FormularioRegistroSanitario';
import ListaRegistrosSanitarios from './ListaRegistrosSanitarios';
import AlertasSanitarias from './AlertasSanitarias';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
}

interface RegistroSanitario {
  _id: string;
  vacaId: string;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  tipo: string;
  fecha: string;
  nombre: string;
  producto?: string;
  dosis?: string;
  veterinario?: string;
  proximaFecha?: string;
  costo?: number;
  completado: boolean;
  observaciones?: string;
}

const GestionSanitariaApp: React.FC = () => {
  const [registros, setRegistros] = useState<RegistroSanitario[]>([]);
  const [vacas, setVacas] = useState<Vaca[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<RegistroSanitario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<'historial' | 'alertas'>('historial');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [registrosRes, vacasRes] = await Promise.all([
        fetch('/api/registros-sanitarios?limit=1000'),
        fetch('/api/vacas?limit=1000')
      ]);

      if (!registrosRes.ok || !vacasRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [registrosData, vacasData] = await Promise.all([
        registrosRes.json(),
        vacasRes.json()
      ]);

      setRegistros(registrosData.registros || []);
      setVacas(vacasData.vacas || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (datos: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Si es registro por lote, crear múltiples registros
      if (datos.esLote && datos.registrosLote && Array.isArray(datos.registrosLote)) {
        let registrosCreados = 0;
        let erroresRegistros = 0;

        for (const registro of datos.registrosLote) {
          try {
            const response = await fetch('/api/registros-sanitarios', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(registro)
            });

            if (response.ok) {
              registrosCreados++;
            } else {
              erroresRegistros++;
            }
          } catch {
            erroresRegistros++;
          }
        }

        if (registrosCreados > 0) {
          setSuccessMessage(`Registro aplicado a ${registrosCreados} vaca(s)${erroresRegistros > 0 ? ` (${erroresRegistros} errores)` : ''}`);
        } else {
          throw new Error('No se pudo crear ningún registro');
        }
      } else {
        // Registro individual normal
        const url = registroEditando 
          ? `/api/registros-sanitarios/${registroEditando._id}`
          : '/api/registros-sanitarios';
        
        const response = await fetch(url, {
          method: registroEditando ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al guardar');
        }

        setSuccessMessage(registroEditando ? 'Registro actualizado' : 'Registro creado');
      }

      setMostrarFormulario(false);
      setRegistroEditando(null);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/registros-sanitarios/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setSuccessMessage('Registro eliminado');
      await cargarDatos();
    } catch (err) {
      setError('Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏥 Gestión Sanitaria
          </h1>
          <p className="text-gray-600">
            Control completo de vacunas, tratamientos y revisiones veterinarias
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

        {mostrarFormulario ? (
          <FormularioRegistroSanitario
            onSubmit={handleSubmit}
            isLoading={isLoading}
            datosIniciales={registroEditando || {}}
            vacasDisponibles={vacas}
            onCancelar={() => {
              setMostrarFormulario(false);
              setRegistroEditando(null);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Botones de acción y vista */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setVistaActual('historial')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    vistaActual === 'historial'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  📋 Historial
                </button>
                <button
                  onClick={() => setVistaActual('alertas')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    vistaActual === 'alertas'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🔔 Alertas y Recordatorios
                </button>
              </div>

              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium w-full sm:w-auto"
              >
                + Nuevo Registro
              </button>
            </div>

            {/* Contenido según vista */}
            {vistaActual === 'historial' ? (
              <ListaRegistrosSanitarios
                registros={registros}
                onEditar={(reg) => {
                  setRegistroEditando(reg);
                  setMostrarFormulario(true);
                }}
                onEliminar={handleEliminar}
                isLoading={isLoading}
              />
            ) : (
              <AlertasSanitarias />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionSanitariaApp;

