'use client';

import React, { useState, useEffect } from 'react';

interface Procedimiento {
  _id: string;
  tipo: string;
  nombre: string;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  proximaFecha: string;
}

interface AlertasSanitariasProps {
  onVerProcedimiento?: (id: string) => void;
}

const AlertasSanitarias: React.FC<AlertasSanitariasProps> = ({ onVerProcedimiento }) => {
  const [alertas, setAlertas] = useState<{
    vencidos: { cantidad: number; procedimientos: Procedimiento[] };
    proximasSemana: { cantidad: number; procedimientos: Procedimiento[] };
    proximoMes: { cantidad: number; procedimientos: Procedimiento[] };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      const response = await fetch('/api/registros-sanitarios/proximosprocedimientos');
      if (response.ok) {
        const data = await response.json();
        setAlertas(data);
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    const iconos: { [key: string]: string } = {
      vacuna: '💉',
      desparasitacion: '🐛',
      tratamiento: '💊',
      revision: '🔍',
      cirugia: '🏥',
      otro: '📋'
    };
    return iconos[tipo] || '📋';
  };

  const calcularDiasHasta = (fecha: string) => {
    const hoy = new Date();
    const futura = new Date(fecha);
    return Math.ceil((futura.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!alertas || (alertas.vencidos.cantidad === 0 && alertas.proximasSemana.cantidad === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">No hay procedimientos pendientes</p>
          <p className="text-sm mt-1">Todos los procedimientos están al día</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vencidos */}
      {alertas.vencidos.cantidad > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-100 border-b border-red-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Procedimientos Vencidos
              </h3>
              <span className="px-3 py-1 bg-red-200 text-red-800 text-sm font-semibold rounded-full">
                {alertas.vencidos.cantidad}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {alertas.vencidos.procedimientos.map((proc) => (
              <div key={proc._id} className="px-6 py-4 hover:bg-red-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getTipoIcon(proc.tipo)}</span>
                      <p className="font-semibold text-gray-900">{proc.nombre}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {proc.numeroIdentificacionVaca}
                      {proc.nombreVaca && ` - ${proc.nombreVaca}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">Vencido</p>
                    <p className="text-xs text-gray-500">
                      {new Date(proc.proximaFecha).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próxima Semana */}
      {alertas.proximasSemana.cantidad > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-yellow-100 border-b border-yellow-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Próxima Semana
              </h3>
              <span className="px-3 py-1 bg-yellow-200 text-yellow-800 text-sm font-semibold rounded-full">
                {alertas.proximasSemana.cantidad}
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {alertas.proximasSemana.procedimientos.map((proc) => {
              const dias = calcularDiasHasta(proc.proximaFecha);
              return (
                <div key={proc._id} className="px-6 py-4 hover:bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getTipoIcon(proc.tipo)}</span>
                        <p className="font-semibold text-gray-900">{proc.nombre}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {proc.numeroIdentificacionVaca}
                        {proc.nombreVaca && ` - ${proc.nombreVaca}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-yellow-600">
                        {dias === 0 ? 'Hoy' : `En ${dias} días`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(proc.proximaFecha).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasSanitarias;

