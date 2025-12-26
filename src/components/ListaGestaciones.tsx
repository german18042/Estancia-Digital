'use client';

import React, { useState, useEffect } from 'react';

interface Gestacion {
  _id: string;
  vacaId: string;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  fechaServicio?: string;
  fechaConfirmacion?: string;
  diasGestacionConfirmados?: number;
  fechaProbableParto: string;
  diasGestacionActual?: number;
  trimestreActual?: number;
  estado: string;
  tipoServicio: string;
  toroPadre?: string;
  pesoActual?: number;
  pesoInicial?: number;
  gananciaPeso?: number;
}

interface ListaGestacionesProps {
  gestaciones: Gestacion[];
  onEditar: (gestacion: Gestacion) => void;
  onEliminar: (id: string) => void;
  onRegistrarParto: (gestacion: Gestacion) => void;
  onConfirmar?: (gestacion: Gestacion) => void;
  isLoading?: boolean;
}

const ListaGestaciones: React.FC<ListaGestacionesProps> = ({
  gestaciones,
  onEditar,
  onEliminar,
  onRegistrarParto,
  onConfirmar,
  isLoading = false
}) => {
  const [filtro, setFiltro] = useState('');
  const [filtroDiasRestantes, setFiltroDiasRestantes] = useState('');
  const [gestacionesConCalculos, setGestacionesConCalculos] = useState<Gestacion[]>([]);

  // Función para recalcular días de gestación y trimestre
  const recalcularValoresGestacion = (gestacion: Gestacion): Gestacion => {
    let diasGestacionActual: number;
    let trimestreActual: number;
    const hoy = new Date();

    // Prioridad 1: Si hay días confirmados, usar esos como base
    if (gestacion.fechaConfirmacion && gestacion.diasGestacionConfirmados) {
      const fechaConfirmacion = new Date(gestacion.fechaConfirmacion);
      const diasDesdeConfirmacion = Math.floor((hoy.getTime() - fechaConfirmacion.getTime()) / (1000 * 60 * 60 * 24));
      diasGestacionActual = gestacion.diasGestacionConfirmados + diasDesdeConfirmacion;
      diasGestacionActual = Math.max(0, diasGestacionActual);
    } 
    // Prioridad 2: Si hay fecha de servicio, calcular desde ahí
    else if (gestacion.fechaServicio) {
      const fechaServicio = new Date(gestacion.fechaServicio);
      diasGestacionActual = Math.floor((hoy.getTime() - fechaServicio.getTime()) / (1000 * 60 * 60 * 24));
      diasGestacionActual = Math.max(0, diasGestacionActual);
    } 
    // Si no hay ninguno de los dos
    else {
      diasGestacionActual = 0;
    }

    // Calcular trimestre actual
    if (diasGestacionActual <= 94) {
      trimestreActual = 1; // Primer trimestre: 0-94 días
    } else if (diasGestacionActual <= 189) {
      trimestreActual = 2; // Segundo trimestre: 95-189 días
    } else {
      trimestreActual = 3; // Tercer trimestre: 190+ días
    }

    return {
      ...gestacion,
      diasGestacionActual,
      trimestreActual
    };
  };

  // Recalcular valores cuando cambien las gestaciones
  useEffect(() => {
    const gestacionesRecalculadas = gestaciones.map(recalcularValoresGestacion);
    setGestacionesConCalculos(gestacionesRecalculadas);
  }, [gestaciones]);

  // Actualizar automáticamente cada 24 horas para reflejar el paso del tiempo
  useEffect(() => {
    const actualizarDiariamente = () => {
      const gestacionesRecalculadas = gestaciones.map(recalcularValoresGestacion);
      setGestacionesConCalculos(gestacionesRecalculadas);
    };

    // Calcular milisegundos hasta la medianoche del próximo día
    const ahora = new Date();
    const medianoche = new Date(ahora);
    medianoche.setDate(ahora.getDate() + 1);
    medianoche.setHours(0, 0, 0, 0);
    const tiempoHastaMedianoche = medianoche.getTime() - ahora.getTime();

    // Configurar timeout para la primera actualización a medianoche
    const timeoutInicial = setTimeout(() => {
      actualizarDiariamente();
      
      // Luego configurar intervalo cada 24 horas
      const intervalo = setInterval(actualizarDiariamente, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalo);
    }, tiempoHastaMedianoche);

    return () => clearTimeout(timeoutInicial);
  }, [gestaciones]);

  // Actualizar cuando el usuario regrese a la página (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // La página se volvió visible, recalcular valores
        const gestacionesRecalculadas = gestaciones.map(recalcularValoresGestacion);
        setGestacionesConCalculos(gestacionesRecalculadas);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gestaciones]);
  const [gestacionesFiltradas, setGestacionesFiltradas] = useState<Gestacion[]>([]);

  React.useEffect(() => {
    let filtradas = gestacionesConCalculos;

    if (filtro !== '') {
      filtradas = filtradas.filter(gestacion =>
        gestacion.numeroIdentificacionVaca.toLowerCase().includes(filtro.toLowerCase()) ||
        (gestacion.nombreVaca && gestacion.nombreVaca.toLowerCase().includes(filtro.toLowerCase())) ||
        (gestacion.toroPadre && gestacion.toroPadre.toLowerCase().includes(filtro.toLowerCase()))
      );
    }


    if (filtroDiasRestantes !== '') {
      filtradas = filtradas.filter(gestacion => {
        const diasRestantes = calcularDiasRestantes(gestacion);
        
        switch (filtroDiasRestantes) {
          case 'critico': // 0-14 días
            return diasRestantes >= 0 && diasRestantes <= 14;
          case 'cercano': // 15-30 días
            return diasRestantes >= 15 && diasRestantes <= 30;
          case 'proximo': // 31-60 días
            return diasRestantes >= 31 && diasRestantes <= 60;
          case 'lejano': // 61+ días
            return diasRestantes > 60;
          case 'vencido': // Vencido
            return diasRestantes < 0;
          default:
            return true;
        }
      });
    }

    setGestacionesFiltradas(filtradas);
  }, [filtro, filtroDiasRestantes, gestacionesConCalculos]);

  const calcularDiasRestantes = (gestacion: Gestacion) => {
    // Usar exactamente los mismos días que se muestran en la tabla
    const diasMostrados = gestacion.diasGestacionConfirmados || gestacion.diasGestacionActual || 0;
    
    // Si hay confirmación, calcular días actuales desde la fecha de confirmación
    if (gestacion.fechaConfirmacion && gestacion.diasGestacionConfirmados) {
      const hoy = new Date();
      const fechaConfirmacion = new Date(gestacion.fechaConfirmacion);
      const diasDesdeConfirmacion = Math.floor((hoy.getTime() - fechaConfirmacion.getTime()) / (1000 * 60 * 60 * 24));
      const diasActuales = gestacion.diasGestacionConfirmados + diasDesdeConfirmacion;
      const diasRestantes = 283 - Math.max(0, diasActuales);
      return diasRestantes;
    }
    
    // Si no hay confirmación, usar los días mostrados directamente
    const diasRestantes = 283 - diasMostrados;
    return diasRestantes;
  };

  const getEstadoLabel = (estado: string) => {
    const estados: { [key: string]: string } = {
      'en_gestacion': 'En Gestación',
      'parto_exitoso': 'Parto Exitoso',
      'aborto': 'Aborto',
      'parto_dificil': 'Parto Difícil',
      'complicaciones': 'Complicaciones'
    };
    return estados[estado] || estado;
  };

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'en_gestacion': 'bg-blue-100 text-blue-800',
      'parto_exitoso': 'bg-green-100 text-green-800',
      'aborto': 'bg-red-100 text-red-800',
      'parto_dificil': 'bg-yellow-100 text-yellow-800',
      'complicaciones': 'bg-orange-100 text-orange-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const getTipoServicioLabel = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'monta_natural': 'Monta Natural',
      'inseminacion_artificial': 'Inseminación Artificial',
      'transferencia_embrion': 'Transferencia de Embrión'
    };
    return tipos[tipo] || tipo;
  };

  const getTrimestreLabel = (trimestre?: number) => {
    if (!trimestre) return '';
    const trimestres = ['', '1er Trimestre', '2do Trimestre', '3er Trimestre'];
    return trimestres[trimestre];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Gestaciones Activas</h2>
          <span className="text-sm text-gray-600">
            {gestacionesFiltradas.length} de {gestaciones.length} gestaciones
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por vaca, toro..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={filtroDiasRestantes}
              onChange={(e) => setFiltroDiasRestantes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            >
              <option value="">Todos los tiempos</option>
              <option value="critico">🔴 Crítico (0-14 días)</option>
              <option value="cercano">🟡 Cercano (15-30 días)</option>
              <option value="proximo">🟢 Próximo (31-60 días)</option>
              <option value="lejano">⚪ Lejano (60+ días)</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vaca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Días Gest.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trimestre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Días Rest.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gestacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  {filtro ? 'No se encontraron gestaciones con ese criterio' : 'No hay gestaciones registradas'}
                </td>
              </tr>
            ) : (
              gestacionesFiltradas.map((gestacion) => {
                const diasRestantes = calcularDiasRestantes(gestacion);
                const esCritica = diasRestantes <= 14 && diasRestantes >= 0;
                const esCercana = diasRestantes <= 30 && diasRestantes >= 0;
                
                return (
                  <tr key={gestacion._id} className={`hover:bg-gray-50 ${esCritica ? 'bg-red-50' : esCercana ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {gestacion.numeroIdentificacionVaca}
                        </div>
                        {gestacion.nombreVaca && (
                          <div className="text-sm text-gray-500">{gestacion.nombreVaca}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTipoServicioLabel(gestacion.tipoServicio)}
                      </div>
                      {gestacion.toroPadre && (
                        <div className="text-sm text-gray-500">Toro: {gestacion.toroPadre}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {gestacion.diasGestacionConfirmados || gestacion.diasGestacionActual || 0} días
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTrimestreLabel(gestacion.trimestreActual)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${esCritica ? 'text-red-600' : esCercana ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(gestacion.estado)}`}>
                        {getEstadoLabel(gestacion.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gestacion.pesoActual ? `${gestacion.pesoActual} kg` : '-'}
                      </div>
                      {gestacion.gananciaPeso && (
                        <div className="text-sm text-gray-500">
                          +{gestacion.gananciaPeso.toFixed(1)} kg
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        {/* Botón de confirmar gestación - solo si NO está confirmada */}
                        {!gestacion.fechaConfirmacion && onConfirmar && (
                          <button
                            onClick={() => onConfirmar(gestacion)}
                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-semibold"
                            title="Confirmar gestación con datos del veterinario"
                          >
                            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Confirmar Gestación
                          </button>
                        )}
                        
                        {/* Botón de registrar parto - siempre visible */}
                        <button
                          onClick={() => onRegistrarParto(gestacion)}
                          className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs font-semibold"
                          title={diasRestantes <= 7 ? "Fecha de parto próxima" : "Registrar parto o aborto"}
                        >
                          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Registrar Parto
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEditar(gestacion)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onEliminar(gestacion._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaGestaciones;
