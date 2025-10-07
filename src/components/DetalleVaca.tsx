'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vaca {
  _id: string;
  numeroIdentificacion: string;
  nombre?: string;
  fechaNacimiento: string;
  sexo: 'macho' | 'hembra';
  raza: string;
  colorPelaje: string;
  peso: number;
  alturaCruz: number;
  estadoReproductivo: string;
  ubicacionActual: string;
  condicionCorporal: number;
  estadoSalud: string;
  padre?: string;
  madre?: string;
  observaciones?: string;
  produccionLecheraDiaria?: number;
}

interface Gestacion {
  _id: string;
  numeroIdentificacionVaca: string;
  fechaServicio?: string;
  fechaProbableParto: string;
  diasGestacionActual?: number;
  estado: string;
  crias?: Array<{
    numeroIdentificacion: string;
    sexo: 'macho' | 'hembra';
    pesoNacimiento: number;
  }>;
}

interface DetalleVacaProps {
  vacaId: string;
  onCerrar: () => void;
}

const DetalleVaca: React.FC<DetalleVacaProps> = ({ vacaId, onCerrar }) => {
  const [vaca, setVaca] = useState<Vaca | null>(null);
  const [padreInfo, setPadreInfo] = useState<Vaca | null>(null);
  const [madreInfo, setMadreInfo] = useState<Vaca | null>(null);
  const [hijos, setHijos] = useState<Vaca[]>([]);
  const [gestaciones, setGestaciones] = useState<Gestacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarDatosCompletos();
  }, [vacaId]);

  const cargarDatosCompletos = async () => {
    setIsLoading(true);
    try {
      // Cargar datos de la vaca
      const vacaRes = await fetch(`/api/vacas/${vacaId}`);
      if (vacaRes.ok) {
        const vacaData = await vacaRes.json();
        setVaca(vacaData);

        // Cargar información del padre si existe
        if (vacaData.padre) {
          const todasVacasRes = await fetch('/api/vacas');
          if (todasVacasRes.ok) {
            const { vacas } = await todasVacasRes.json();
            const padre = vacas.find((v: Vaca) => v.numeroIdentificacion === vacaData.padre);
            if (padre) setPadreInfo(padre);
          }
        }

        // Cargar información de la madre si existe
        if (vacaData.madre) {
          const todasVacasRes = await fetch('/api/vacas');
          if (todasVacasRes.ok) {
            const { vacas } = await todasVacasRes.json();
            const madre = vacas.find((v: Vaca) => v.numeroIdentificacion === vacaData.madre);
            if (madre) setMadreInfo(madre);
          }
        }

        // Buscar hijos (vacas que tienen a esta como padre o madre)
        const todasVacasRes = await fetch('/api/vacas');
        if (todasVacasRes.ok) {
          const { vacas } = await todasVacasRes.json();
          const hijosEncontrados = vacas.filter(
            (v: Vaca) => 
              v.padre === vacaData.numeroIdentificacion || 
              v.madre === vacaData.numeroIdentificacion
          );
          setHijos(hijosEncontrados);
        }

        // Cargar gestaciones si es hembra
        if (vacaData.sexo === 'hembra') {
          const gestacionesRes = await fetch('/api/gestacion');
          if (gestacionesRes.ok) {
            const { gestaciones: todasGestaciones } = await gestacionesRes.json();
            const gestacionesVaca = todasGestaciones.filter(
              (g: Gestacion) => g.numeroIdentificacionVaca === vacaData.numeroIdentificacion
            );
            setGestaciones(gestacionesVaca);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!vaca) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{vaca.numeroIdentificacion}</h2>
              {vaca.nombre && <p className="text-xl mt-1">{vaca.nombre}</p>}
              <p className="text-blue-100 mt-2">
                {vaca.raza} • {vaca.sexo === 'hembra' ? 'Hembra' : 'Macho'} • {calcularEdad(vaca.fechaNacimiento)} años
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(vaca.fechaNacimiento).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Peso</p>
              <p className="text-lg font-semibold text-gray-900">{vaca.peso} kg</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Altura</p>
              <p className="text-lg font-semibold text-gray-900">{vaca.alturaCruz} cm</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Color</p>
              <p className="text-lg font-semibold text-gray-900">{vaca.colorPelaje}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Ubicación</p>
              <p className="text-lg font-semibold text-gray-900">{vaca.ubicacionActual}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estado de Salud</p>
              <p className="text-lg font-semibold text-gray-900">{vaca.estadoSalud}</p>
            </div>
          </div>

          {/* Árbol Genealógico */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Árbol Genealógico
            </h3>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg">
              {/* Padres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Padre */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">👨 Padre</p>
                  {padreInfo ? (
                    <div>
                      <p className="font-bold text-blue-600">{padreInfo.numeroIdentificacion}</p>
                      {padreInfo.nombre && <p className="text-sm text-gray-700">{padreInfo.nombre}</p>}
                      <p className="text-sm text-gray-600">{padreInfo.raza}</p>
                    </div>
                  ) : vaca.padre ? (
                    <p className="text-gray-700">{vaca.padre}</p>
                  ) : (
                    <p className="text-gray-400 italic">No registrado</p>
                  )}
                </div>

                {/* Madre */}
                <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                  <p className="text-sm text-gray-600 mb-2">👩 Madre</p>
                  {madreInfo ? (
                    <div>
                      <p className="font-bold text-pink-600">{madreInfo.numeroIdentificacion}</p>
                      {madreInfo.nombre && <p className="text-sm text-gray-700">{madreInfo.nombre}</p>}
                      <p className="text-sm text-gray-600">{madreInfo.raza}</p>
                    </div>
                  ) : vaca.madre ? (
                    <p className="text-gray-700">{vaca.madre}</p>
                  ) : (
                    <p className="text-gray-400 italic">No registrada</p>
                  )}
                </div>
              </div>

              {/* Animal Actual */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 shadow-lg">
                  <p className="text-center font-bold text-xl">{vaca.numeroIdentificacion}</p>
                  {vaca.nombre && <p className="text-center text-sm">{vaca.nombre}</p>}
                </div>
              </div>

              {/* Hijos */}
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-3">
                  👶 Descendencia ({hijos.length})
                </p>
                {hijos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hijos.map((hijo) => (
                      <div key={hijo._id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-semibold text-gray-800">{hijo.numeroIdentificacion}</p>
                        {hijo.nombre && <p className="text-sm text-gray-600">{hijo.nombre}</p>}
                        <p className="text-xs text-gray-500">
                          {hijo.sexo === 'hembra' ? '♀' : '♂'} {hijo.raza}
                        </p>
                        <p className="text-xs text-gray-500">
                          {calcularEdad(hijo.fechaNacimiento)} años
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-center py-4">Sin descendencia registrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Historial de Gestaciones (solo hembras) */}
          {vaca.sexo === 'hembra' && gestaciones.length > 0 && (
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📋 Historial de Gestaciones</h3>
              <div className="space-y-3">
                {gestaciones.map((gestacion) => (
                  <div key={gestacion._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Estado: <span className="text-green-600">{gestacion.estado}</span>
                        </p>
                        {gestacion.fechaServicio && (
                          <p className="text-sm text-gray-600">
                            Servicio: {new Date(gestacion.fechaServicio).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Parto probable: {new Date(gestacion.fechaProbableParto).toLocaleDateString()}
                        </p>
                      </div>
                      {gestacion.diasGestacionActual && (
                        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                          {gestacion.diasGestacionActual} días
                        </div>
                      )}
                    </div>
                    {gestacion.crias && gestacion.crias.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-sm font-semibold text-gray-700">Crías:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                          {gestacion.crias.map((cria, idx) => (
                            <div key={idx} className="text-sm text-gray-600">
                              {cria.numeroIdentificacion} ({cria.sexo === 'hembra' ? '♀' : '♂'}) - {cria.pesoNacimiento}kg
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {vaca.observaciones && (
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📝 Observaciones</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700">{vaca.observaciones}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <button
            onClick={onCerrar}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleVaca;

