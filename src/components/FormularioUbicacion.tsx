'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Importar el mapa dinámicamente para evitar problemas SSR
const MapComponent = dynamic(() => import('./MapaUbicacion'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-200 flex items-center justify-center rounded-lg">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>
  )
});

interface FormularioUbicacionProps {
  onSubmit: (datos: any) => void;
  isLoading?: boolean;
  datosIniciales?: any;
  ubicacionesExistentes?: any[]; // Para mostrar las áreas ya creadas en el mapa
}

const FormularioUbicacion: React.FC<FormularioUbicacionProps> = ({
  onSubmit,
  isLoading = false,
  datosIniciales = {},
  ubicacionesExistentes = []
}) => {
  // Log para debug
  const [formData, setFormData] = useState({
    nombre: datosIniciales.nombre || '',
    tipo: datosIniciales.tipo || 'potrero',
    capacidad: datosIniciales.capacidad || '',
    area: datosIniciales.area || '',
    tipoPasto: datosIniciales.tipoPasto || '',
    sistemaRiego: datosIniciales.sistemaRiego || '',
    color: datosIniciales.color || '#ffff00', // Amarillo por defecto
    descripcion: datosIniciales.descripcion || '',
    caracteristicas: datosIniciales.caracteristicas?.join(', ') || '',
    estado: datosIniciales.estado || 'activa'
  });

  const [geometria, setGeometria] = useState<any>(datosIniciales.geometria || null);
  const [modoEntrada, setModoEntrada] = useState<'mapa' | 'manual'>('mapa');
  const [areaCalculada, setAreaCalculada] = useState<string>(''); // Estado separado para el área calculada
  
  // Coordenadas del centro del mapa - desde ubicación de la finca o valores por defecto
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
    if (typeof window !== 'undefined') {
      const fincaLat = localStorage.getItem('fincaLat');
      const fincaLng = localStorage.getItem('fincaLng');
      if (fincaLat && fincaLng) {
        return [parseFloat(fincaLat), parseFloat(fincaLng)];
      }
      // Fallback a coordenadas guardadas anteriormente
      const savedLat = localStorage.getItem('mapCenterLat');
      const savedLng = localStorage.getItem('mapCenterLng');
      if (savedLat && savedLng) {
        return [parseFloat(savedLat), parseFloat(savedLng)];
      }
    }
    return [-34.6037, -58.3816]; // Buenos Aires por defecto
  });
  
  const [mapZoom, setMapZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedZoom = localStorage.getItem('mapZoom');
      if (savedZoom) {
        return parseInt(savedZoom);
      }
    }
    return 16; // Zoom más cercano para ver la casa principal
  });
  const [coordenadasManuales, setCoordenadasManuales] = useState<Array<{latitud: string, longitud: string}>>(
    datosIniciales.coordenadas?.map((c: any) => ({
      latitud: c.latitud?.toString() || '',
      longitud: c.longitud?.toString() || ''
    })) || [{ latitud: '', longitud: '' }]
  );


  useEffect(() => {
    if (datosIniciales && Object.keys(datosIniciales).length > 0) {
      setFormData({
        nombre: datosIniciales.nombre || '',
        tipo: datosIniciales.tipo || 'potrero',
        capacidad: datosIniciales.capacidad || '',
        area: datosIniciales.area || '',
        tipoPasto: datosIniciales.tipoPasto || '',
        sistemaRiego: datosIniciales.sistemaRiego || '',
        color: datosIniciales.color || '#ffff00',
        descripcion: datosIniciales.descripcion || '',
        caracteristicas: datosIniciales.caracteristicas?.join(', ') || '',
        estado: datosIniciales.estado || 'activa'
      });
      setGeometria(datosIniciales.geometria || null);
      
      if (datosIniciales.coordenadas && datosIniciales.coordenadas.length > 0) {
        setCoordenadasManuales(
          datosIniciales.coordenadas.map((c: any) => ({
            latitud: c.latitud?.toString() || '',
            longitud: c.longitud?.toString() || ''
          }))
        );
        setModoEntrada('manual');
      } else if (datosIniciales.geometria) {
        setModoEntrada('mapa');
      }
    }
  }, [datosIniciales]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePolygonComplete = useCallback((geoJson: any, areaEnHectareas: number) => {
    // Este callback se ejecuta cuando se completa el dibujo del polígono
    console.log('🎯🎯🎯 handlePolygonComplete llamado 🎯🎯🎯');
    console.log('✅ Polígono completado:', geoJson);
    console.log('📏 Área recibida:', areaEnHectareas);
    console.log('📏 Tipo de área:', typeof areaEnHectareas);
    console.log('📏 Es NaN?:', isNaN(areaEnHectareas));
    console.log('📏 Es finito?:', isFinite(areaEnHectareas));
    
    // Asegurar que el área sea un número válido
    const areaNumero = typeof areaEnHectareas === 'number' && 
                       isFinite(areaEnHectareas) && 
                       !isNaN(areaEnHectareas) && 
                       areaEnHectareas > 0
      ? areaEnHectareas 
      : 0;
    
    console.log('📏 Área validada:', areaNumero);
    
    if (areaNumero === 0) {
      console.error('❌ Error: Área inválida o cero');
      console.error('❌ Valor original:', areaEnHectareas);
      alert('Error: No se pudo calcular el área del polígono. Por favor, intenta dibujar nuevamente.');
      return;
    }
    
    const areaString = areaNumero.toFixed(4);
    console.log('📏 Área como string:', areaString);
    
    // Actualizar geometría primero
    setGeometria(geoJson);
    console.log('✅ Geometría actualizada');
    
    // Actualizar área calculada PRIMERO (esto es crítico para que se muestre en el input)
    console.log('💾 Guardando área calculada en areaCalculada:', areaString);
    setAreaCalculada(areaString);
    
    // Luego actualizar formData con el área
    console.log('💾 Actualizando formData con área:', areaString);
    setFormData(prev => {
      console.log('📝 Actualizando formData. Área anterior:', prev.area);
      const nuevoFormData = {
        ...prev,
        area: areaString
      };
      console.log('📝 Nuevo formData con área:', nuevoFormData.area);
      return nuevoFormData;
    });
    
    console.log('✅✅✅ Área guardada en ambos estados:', areaString);
    
    // Forzar re-render después de un breve delay para asegurar actualización
    setTimeout(() => {
      console.log('🔄 Verificando actualización final...');
      setAreaCalculada(areaString);
      setFormData(current => {
        if (current.area !== areaString) {
          console.warn('⚠️ El área no se actualizó en formData. Forzando...');
          return { ...current, area: areaString };
        }
        console.log('✅ Área confirmada en formData:', current.area);
        return current;
      });
    }, 100);
    
    // Forzar re-render verificando el estado
    setTimeout(() => {
      console.log('🔍 Verificación después de 500ms...');
      setFormData(current => {
        console.log('📊 Estado actual de formData:', current);
        return current;
      });
    }, 500);
  }, []);

  const handleAddCoordenada = () => {
    setCoordenadasManuales([...coordenadasManuales, { latitud: '', longitud: '' }]);
  };

  const handleRemoveCoordenada = (index: number) => {
    const nuevas = coordenadasManuales.filter((_, i) => i !== index);
    setCoordenadasManuales(nuevas.length > 0 ? nuevas : [{ latitud: '', longitud: '' }]);
  };

  const handleCoordenadaChange = (index: number, field: 'latitud' | 'longitud', value: string) => {
    const nuevas = [...coordenadasManuales];
    nuevas[index][field] = value;
    setCoordenadasManuales(nuevas);
  };

  const calcularAreaDesdeCoordenadas = () => {
    // Validar que todas las coordenadas estén completas
    const todasCompletas = coordenadasManuales.every(c => 
      c.latitud && c.longitud && 
      !isNaN(parseFloat(c.latitud)) && 
      !isNaN(parseFloat(c.longitud))
    );

    if (!todasCompletas || coordenadasManuales.length < 3) {
      return;
    }

    // Convertir a formato GeoJSON Polygon
    const coordinates = coordenadasManuales.map(c => [
      parseFloat(c.longitud), // GeoJSON usa [lng, lat]
      parseFloat(c.latitud)
    ]);

    // Cerrar el polígono (el último punto debe ser igual al primero)
    if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
      coordinates.push([...coordinates[0]]);
    }

    const geoJson = {
      type: 'Polygon',
      coordinates: [coordinates]
    };

    // Calcular área usando Turf.js
    import('@turf/turf').then((turf) => {
      // Crear un Feature a partir del GeoJSON
      const feature = turf.polygon(geoJson.coordinates);
      const areaM2 = turf.area(feature);
      const areaHectareas = areaM2 / 10000;
      
      setGeometria(geoJson);
      setFormData(prev => ({
        ...prev,
        area: areaHectareas.toFixed(2)
      }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar y convertir área
    let areaNumerica: number | undefined;
    if (formData.area) {
      const areaParseada = parseFloat(String(formData.area));
      if (!isNaN(areaParseada) && areaParseada > 0) {
        areaNumerica = areaParseada;
        console.log('✅ Área validada:', areaNumerica, 'hectáreas');
      } else {
        console.warn('⚠️ Área inválida:', formData.area);
      }
    }

    // Asegurar que el color siempre tenga un valor válido
    const colorFinal = (formData.color && formData.color.trim() !== '' && formData.color.match(/^#[0-9A-Fa-f]{6}$/)) 
      ? formData.color.trim() 
      : '#ffff00';
    
    const datosParaEnviar: any = {
      ...formData,
      capacidad: formData.capacidad ? parseInt(String(formData.capacidad)) : undefined,
      area: areaNumerica, // Usar el área validada
      caracteristicas: formData.caracteristicas 
        ? formData.caracteristicas.split(',').map((c: string) => c.trim()).filter((c: string) => c) 
        : [],
      tipoPasto: formData.tipoPasto || undefined,
      sistemaRiego: formData.sistemaRiego || undefined,
      color: colorFinal, // Siempre incluir color válido
    };
    
    console.log('🎨 Color del formulario:', formData.color);
    console.log('🎨 Color final a enviar:', colorFinal);
    console.log('📤 Datos completos a enviar:', JSON.stringify(datosParaEnviar, null, 2));

    // Agregar geometría si existe
    if (geometria) {
      datosParaEnviar.geometria = geometria;
      console.log('📤 Enviando geometría:', JSON.stringify(geometria, null, 2));
    } else {
      console.warn('⚠️ No hay geometría definida');
    }

    console.log('📤 Datos a enviar:', JSON.stringify(datosParaEnviar, null, 2));

    // Si hay coordenadas manuales válidas, agregarlas
    if (modoEntrada === 'manual' && coordenadasManuales.some(c => c.latitud && c.longitud)) {
      const coordenadasValidas = coordenadasManuales
        .filter(c => c.latitud && c.longitud)
        .map(c => ({
          latitud: parseFloat(c.latitud),
          longitud: parseFloat(c.longitud)
        }));
      
      if (coordenadasValidas.length >= 3) {
        datosParaEnviar.coordenadas = coordenadasValidas;
      }
    }

    onSubmit(datosParaEnviar);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
        {datosIniciales._id ? 'Editar Ubicación' : 'Nueva Ubicación'}
      </h2>

      {/* Selector de modo de entrada */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Delimitación
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="modoEntrada"
              value="mapa"
              checked={modoEntrada === 'mapa'}
              onChange={() => setModoEntrada('mapa')}
              className="mr-2"
            />
            🗺️ Dibujar en el Mapa
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="modoEntrada"
              value="manual"
              checked={modoEntrada === 'manual'}
              onChange={() => setModoEntrada('manual')}
              className="mr-2"
            />
            📍 Coordenadas Manuales
          </label>
        </div>
      </div>

      {/* Mapa interactivo */}
      {modoEntrada === 'mapa' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delimita el Potrero en el Mapa Satelital
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Usa la herramienta de dibujo (ícono de polígono) en la esquina superior derecha del mapa para dibujar el área del potrero.
          </p>
          
          <p className="text-xs text-blue-600 mb-2 font-semibold">
            💡 El mapa se centra automáticamente en la ubicación de la casa principal de tu finca (si está marcada). Usa el botón &quot;🏠 Marcar Casa Principal&quot; en la esquina superior izquierda del mapa para configurarla.
          </p>
          
          <MapComponent
            onPolygonComplete={(geoJson: any, area: number) => {
              console.log('🔗 MapComponent recibió callback, llamando handlePolygonComplete...');
              console.log('🔗 Área recibida:', area);
              handlePolygonComplete(geoJson, area);
            }}
            editable={true}
            height="500px"
            center={mapCenter}
            zoom={mapZoom}
            currentGeometria={geometria}
            showFincaMarker={true}
            geometriasExistentes={ubicacionesExistentes.filter(u => u.geometria && (!datosIniciales._id || u._id !== datosIniciales._id))} // Excluir la actual si se está editando
            onFincaLocationSet={(lat, lng) => {
              setMapCenter([lat, lng]);
              setMapZoom(16);
            }}
          />
          {geometria && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-semibold">
                ✅ Polígono delimitado correctamente
              </p>
              <p className="text-sm text-green-600 mt-1">
                Área calculada: <strong>{formData.area} hectáreas</strong>
              </p>
              <p className="text-xs text-green-500 mt-1">
                Puedes completar el formulario y guardar la ubicación
              </p>
            </div>
          )}
        </div>
      )}

      {/* Entrada manual de coordenadas */}
      {modoEntrada === 'manual' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingresa las Coordenadas del Polígono (mínimo 3 puntos)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Ingresa las coordenadas en formato decimal (ej: -34.6037 para latitud, -58.3816 para longitud).
            Las coordenadas deben formar un polígono cerrado.
          </p>
          
          <div className="space-y-2 mb-3">
            {coordenadasManuales.map((coord, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="text-sm font-medium text-gray-600 w-8">P{index + 1}:</span>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitud"
                  value={coord.latitud}
                  onChange={(e) => handleCoordenadaChange(index, 'latitud', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitud"
                  value={coord.longitud}
                  onChange={(e) => handleCoordenadaChange(index, 'longitud', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {coordenadasManuales.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCoordenada(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddCoordenada}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Agregar Punto
            </button>
            <button
              type="button"
              onClick={calcularAreaDesdeCoordenadas}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Calcular Área
            </button>
          </div>

          {formData.area && (
            <p className="mt-2 text-sm text-green-600">
              ✅ Área calculada: {formData.area} hectáreas
            </p>
          )}
        </div>
      )}

      {/* Campos del formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Potrero/Lote *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Potrero Norte"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="potrero">Potrero</option>
            <option value="corral">Corral</option>
            <option value="establo">Establo</option>
            <option value="area_especial">Área Especial</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Tipo de Pasto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Pasto
          </label>
          <input
            type="text"
            name="tipoPasto"
            value={formData.tipoPasto}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Rye Grass, Alfalfa, Bermuda"
          />
        </div>

        {/* Sistema de Riego */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sistema de Riego
          </label>
          <select
            name="sistemaRiego"
            value={formData.sistemaRiego}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Seleccione...</option>
            <option value="aspersion">Aspersión</option>
            <option value="inundacion">Inundación</option>
            <option value="lluvia_temporal">Lluvia/Temporal</option>
          </select>
        </div>

        {/* Color del Área */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color del Área en el Mapa
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="#ffff00"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Selecciona un color para identificar esta área en el mapa. El color aparecerá como borde y relleno del polígono.
          </p>
        </div>

        {/* Capacidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacidad (animales)
          </label>
          <input
            type="number"
            name="capacidad"
            value={formData.capacidad}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Número máximo de animales"
          />
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área (hectáreas) *
          </label>
          <input
            type="number"
            name="area"
            key={`area-input-${areaCalculada || formData.area || 'empty'}`}
            value={areaCalculada || formData.area || ''}
            data-area-calculada={areaCalculada || ''}
            data-form-data-area={formData.area || ''}
            onChange={(e) => {
              // Si hay geometría o área calculada, no permitir edición manual
              if (geometria || areaCalculada) {
                return;
              }
              // Limpiar área calculada si se edita manualmente
              setAreaCalculada('');
              handleChange(e);
            }}
            min="0"
            step="0.0001"
            required
            readOnly={!!geometria || !!areaCalculada} // Solo lectura si hay geometría o área calculada
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              geometria || areaCalculada ? 'bg-green-50 border-green-300 font-semibold' : 'bg-gray-50 border-gray-300'
            }`}
            placeholder="Área en hectáreas"
            style={{ cursor: (geometria || areaCalculada) ? 'not-allowed' : 'text' }}
          />
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-xs ${geometria || areaCalculada ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
              {geometria || areaCalculada
                ? `✅ Área calculada automáticamente: ${areaCalculada || formData.area || 'calculando...'} hectáreas` 
                : 'Se calcula automáticamente al dibujar en el mapa o ingresar coordenadas'}
            </p>
            {(formData.area || areaCalculada) && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
                {areaCalculada || formData.area} ha
              </span>
            )}
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="activa">Activa</option>
            <option value="mantenimiento">En Mantenimiento</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </div>

        {/* Características */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Características (separadas por comas)
          </label>
          <input
            type="text"
            name="caracteristicas"
            value={formData.caracteristicas}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Sombra, Agua, Comedero, Bebedero"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Detalles adicionales sobre la ubicación..."
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading || !formData.area}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : datosIniciales._id ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default FormularioUbicacion;
