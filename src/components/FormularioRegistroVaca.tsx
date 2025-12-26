'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FormularioRegistroVacaProps {
  onSubmit: (datosVaca: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  vacasRegistradas?: Array<{
    _id: string;
    numeroIdentificacion: string;
    nombre?: string;
    sexo: string;
  }>;
}

const FormularioRegistroVaca: React.FC<FormularioRegistroVacaProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  vacasRegistradas = []
}) => {
  const [padreInput, setPadreInput] = useState(datosIniciales.padre || '');
  const [madreInput, setMadreInput] = useState(datosIniciales.madre || '');
  const [mostrarPadres, setMostrarPadres] = useState(false);
  const [mostrarMadres, setMostrarMadres] = useState(false);
  const [lotesDisponibles, setLotesDisponibles] = useState<Array<{ _id: string; nombre: string; color: string }>>([]);
  const padreRef = useRef<HTMLDivElement>(null);
  const madreRef = useRef<HTMLDivElement>(null);

  // Cargar lotes disponibles
  useEffect(() => {
    const cargarLotes = async () => {
      try {
        const response = await fetch('/api/lotes?activo=true');
        if (response.ok) {
          const data = await response.json();
          setLotesDisponibles(data.lotes || []);
        }
      } catch (error) {
        console.error('Error al cargar lotes:', error);
      }
    };
    cargarLotes();
  }, []);

  const [formData, setFormData] = useState({
    // Identificación General
    numeroIdentificacion: datosIniciales.numeroIdentificacion || '',
    nombre: datosIniciales.nombre || '',
    fechaNacimiento: datosIniciales.fechaNacimiento 
      ? new Date(datosIniciales.fechaNacimiento).toISOString().split('T')[0]
      : '',
    sexo: datosIniciales.sexo || '',

    // Características Físicas
    raza: datosIniciales.raza || '',
    colorPelaje: datosIniciales.colorPelaje || '',
    peso: datosIniciales.peso || '',
    alturaCruz: datosIniciales.alturaCruz || '',
    caracteristicasDistintivas: datosIniciales.caracteristicasDistintivas || '',

    // Información Reproductiva
    estadoReproductivo: datosIniciales.estadoReproductivo || 'vacia',
    ultimaFechaServicio: datosIniciales.ultimaFechaServicio || '',
    padre: datosIniciales.padre || '',
    madre: datosIniciales.madre || '',

    // Producción
    produccionLecheraDiaria: datosIniciales.produccionLecheraDiaria || '',
    gananciaPeso: datosIniciales.gananciaPeso || '',

    // Salud y Bienestar
    condicionCorporal: datosIniciales.condicionCorporal || '3',
    observacionesComportamiento: datosIniciales.observacionesComportamiento || '',

    // Ubicación y Manejo
    ubicacionActual: datosIniciales.ubicacionActual || '',
    alimentacion: datosIniciales.alimentacion || '',
    lote: datosIniciales.lote || '',

    // Información Genética
    registroGenealogico: datosIniciales.registroGenealogico || '',

    // Datos Económicos
    costoAdquisicion: datosIniciales.costoAdquisicion || '',
    valorEstimado: datosIniciales.valorEstimado || '',
    costosAsociados: datosIniciales.costosAsociados || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePadreChange = (value: string) => {
    setPadreInput(value);
    setFormData(prev => ({
      ...prev,
      padre: value
    }));
    setMostrarPadres(false);
  };

  const handleMadreChange = (value: string) => {
    setMadreInput(value);
    setFormData(prev => ({
      ...prev,
      madre: value
    }));
    setMostrarMadres(false);
  };

  // Filtrar vacas por sexo
  const vacasMachos = vacasRegistradas.filter(vaca => vaca.sexo === 'macho');
  const vacasHembras = vacasRegistradas.filter(vaca => vaca.sexo === 'hembra');

  // Filtrar por búsqueda
  const padresFiltrados = vacasMachos.filter(vaca => 
    vaca.numeroIdentificacion.toLowerCase().includes(padreInput.toLowerCase()) ||
    (vaca.nombre && vaca.nombre.toLowerCase().includes(padreInput.toLowerCase()))
  );

  const madresFiltradas = vacasHembras.filter(vaca => 
    vaca.numeroIdentificacion.toLowerCase().includes(madreInput.toLowerCase()) ||
    (vaca.nombre && vaca.nombre.toLowerCase().includes(madreInput.toLowerCase()))
  );

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (padreRef.current && !padreRef.current.contains(event.target as Node)) {
        setMostrarPadres(false);
      }
      if (madreRef.current && !madreRef.current.contains(event.target as Node)) {
        setMostrarMadres(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir campos numéricos
    const datosParaEnviar = {
      ...formData,
      padre: padreInput || undefined,
      madre: madreInput || undefined,
      peso: formData.peso ? parseFloat(String(formData.peso)) : 0,
      alturaCruz: formData.alturaCruz ? parseFloat(String(formData.alturaCruz)) : 0,
      produccionLecheraDiaria: formData.produccionLecheraDiaria ? parseFloat(String(formData.produccionLecheraDiaria)) : undefined,
      gananciaPeso: formData.gananciaPeso ? parseFloat(String(formData.gananciaPeso)) : undefined,
      condicionCorporal: parseInt(String(formData.condicionCorporal)),
      costoAdquisicion: formData.costoAdquisicion ? parseFloat(String(formData.costoAdquisicion)) : undefined,
      valorEstimado: formData.valorEstimado ? parseFloat(String(formData.valorEstimado)) : undefined,
      costosAsociados: formData.costosAsociados ? parseFloat(String(formData.costosAsociados)) : undefined,
      fechaNacimiento: new Date(formData.fechaNacimiento),
      ultimaFechaServicio: formData.ultimaFechaServicio ? new Date(formData.ultimaFechaServicio) : undefined
    };

    onSubmit(datosParaEnviar);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        {datosIniciales.numeroIdentificacion ? 'Editar Vaca' : 'Registrar Nueva Vaca'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Identificación General */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">Identificación General</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Identificación *
              </label>
              <input
                type="text"
                name="numeroIdentificacion"
                value={formData.numeroIdentificacion}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: V001, B2024-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre (Opcional)
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: Rosita, Bella"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo *
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Seleccionar sexo</option>
                <option value="hembra">Hembra</option>
                <option value="macho">Macho</option>
              </select>
            </div>
          </div>
        </div>

        {/* Características Físicas */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Características Físicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raza *
              </label>
              <select
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Seleccionar raza</option>
                <option value="Holstein">Holstein</option>
                <option value="Jersey">Jersey</option>
                <option value="Gir">Gir</option>
                <option value="Guzerat">Guzerat</option>
                <option value="Nelore">Nelore</option>
                <option value="Angus">Angus</option>
                <option value="Simmental">Simmental</option>
                <option value="Charolais">Charolais</option>
                <option value="Limousin">Limousin</option>
                <option value="Hereford">Hereford</option>
                <option value="Brahman">Brahman</option>
                <option value="Santa Gertrudis">Santa Gertrudis</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color del Pelaje *
              </label>
              <input
                type="text"
                name="colorPelaje"
                value={formData.colorPelaje}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: Negro, Blanco, Marrón, Moteado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg) *
              </label>
              <input
                type="number"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 450.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Altura a la Cruz (cm) *
              </label>
              <input
                type="number"
                name="alturaCruz"
                value={formData.alturaCruz}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 140.5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Características Distintivas
              </label>
              <textarea
                name="caracteristicasDistintivas"
                value={formData.caracteristicasDistintivas}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Marcas, manchas, cicatrices, etc."
              />
            </div>
          </div>
        </div>

        {/* Información Reproductiva */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Información Reproductiva</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Reproductivo *
              </label>
              <select
                name="estadoReproductivo"
                value={formData.estadoReproductivo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="vacia">Vacía</option>
                <option value="gestante">Gestante</option>
                <option value="lactante">Lactante</option>
                <option value="secado">Secado</option>
                <option value="no_apta">No Apta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Última Fecha de Servicio
              </label>
              <input
                type="date"
                name="ultimaFechaServicio"
                value={formData.ultimaFechaServicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Padre
              </label>
              <div className="relative" ref={padreRef}>
                <input
                  type="text"
                  value={padreInput}
                  onChange={(e) => {
                    setPadreInput(e.target.value);
                    setMostrarPadres(true);
                  }}
                  onFocus={() => setMostrarPadres(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Buscar padre o escribir ID manualmente"
                />
                {mostrarPadres && padresFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {padresFiltrados.map((vaca) => (
                      <div
                        key={vaca._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handlePadreChange(vaca.numeroIdentificacion)}
                      >
                        <div className="font-medium text-gray-900">{vaca.numeroIdentificacion}</div>
                        {vaca.nombre && (
                          <div className="text-sm text-gray-500">{vaca.nombre}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Madre
              </label>
              <div className="relative" ref={madreRef}>
                <input
                  type="text"
                  value={madreInput}
                  onChange={(e) => {
                    setMadreInput(e.target.value);
                    setMostrarMadres(true);
                  }}
                  onFocus={() => setMostrarMadres(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Buscar madre o escribir ID manualmente"
                />
                {mostrarMadres && madresFiltradas.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {madresFiltradas.map((vaca) => (
                      <div
                        key={vaca._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleMadreChange(vaca.numeroIdentificacion)}
                      >
                        <div className="font-medium text-gray-900">{vaca.numeroIdentificacion}</div>
                        {vaca.nombre && (
                          <div className="text-sm text-gray-500">{vaca.nombre}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Producción */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Producción</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producción Lechera Diaria (litros)
              </label>
              <input
                type="number"
                name="produccionLecheraDiaria"
                value={formData.produccionLecheraDiaria}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 25.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ganancia de Peso (kg/mes)
              </label>
              <input
                type="number"
                name="gananciaPeso"
                value={formData.gananciaPeso}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 15.2"
              />
            </div>
          </div>
        </div>

        {/* Salud y Bienestar */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Salud y Bienestar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condición Corporal *
              </label>
              <select
                name="condicionCorporal"
                value={formData.condicionCorporal}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="1">1 - Muy Delgada</option>
                <option value="2">2 - Delgada</option>
                <option value="3">3 - Ideal</option>
                <option value="4">4 - Sobrepeso</option>
                <option value="5">5 - Obesa</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones de Comportamiento
              </label>
              <textarea
                name="observacionesComportamiento"
                value={formData.observacionesComportamiento}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Comportamiento, temperamento, etc."
              />
            </div>
          </div>
        </div>

        {/* Ubicación y Manejo */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Ubicación y Manejo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación Actual *
              </label>
              <input
                type="text"
                name="ubicacionActual"
                value={formData.ubicacionActual}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: Potrero A, Lote 1, Establo 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lote o Grupo
              </label>
              <select
                name="lote"
                value={formData.lote}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Sin lote</option>
                {lotesDisponibles.map((lote) => (
                  <option key={lote._id} value={lote.nombre}>
                    {lote.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {lotesDisponibles.length > 0 ? (
                  <>Asigna esta vaca a un lote. <a href="/configuracion" className="text-blue-600 hover:text-blue-800">Gestionar lotes →</a></>
                ) : (
                  <>No hay lotes configurados. <a href="/configuracion" className="text-blue-600 hover:text-blue-800">Crear lotes →</a></>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alimentación
              </label>
              <input
                type="text"
                name="alimentacion"
                value={formData.alimentacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: Pasto + Concentrado, Solo pasto"
              />
            </div>
          </div>
        </div>

        {/* Información Genética */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Información Genética</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registro Genealógico
            </label>
            <input
              type="text"
              name="registroGenealogico"
              value={formData.registroGenealogico}
              onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Número de registro oficial"
            />
          </div>
        </div>

        {/* Datos Económicos */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Datos Económicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de Adquisición ($)
              </label>
              <input
                type="number"
                name="costoAdquisicion"
                value={formData.costoAdquisicion}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 2500000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Estimado ($)
              </label>
              <input
                type="number"
                name="valorEstimado"
                value={formData.valorEstimado}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 3000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costos Asociados ($)
              </label>
              <input
                type="number"
                name="costosAsociados"
                value={formData.costosAsociados}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Ej: 500000"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? 'Guardando...' : (datosIniciales.numeroIdentificacion ? 'Actualizar' : 'Registrar')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioRegistroVaca;
