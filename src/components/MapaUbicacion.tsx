'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, Polygon, useMapEvents, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { area } from '@turf/turf';

// Fix para iconos de Leaflet en Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Componente para dibujar polígonos clickeando
function DrawPolygonTool({ 
  onPolygonComplete, 
  editable = true,
  completedPolygon
}: { 
  onPolygonComplete: (geojson: any, area: number) => void; 
  editable?: boolean;
  completedPolygon?: any; // GeoJSON del polígono completado
}) {
  const map = useMap();
  const [points, setPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][] | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonRef = useRef<L.Polygon | null>(null);
  const completedPolygonRef = useRef<L.Polygon | null>(null);
  const isProcessingRef = useRef(false);

  // Componente interno para capturar clicks
  function ClickHandler() {
    useMapEvents({
      click: (e) => {
        // No procesar clicks si no está en modo dibujo o si se está procesando
        if (!editable || !isDrawing || isProcessingRef.current) {
          return;
        }
        
        // Verificar que el click NO fue en un botón o control
        const originalEvent = e.originalEvent;
        const target = originalEvent.target as HTMLElement;
        
        if (target) {
          // Verificar si el click fue en un botón o en un elemento dentro de un contenedor de controles
          if (target.tagName === 'BUTTON' || 
              target.closest('button') !== null || 
              target.closest('[style*="position: absolute"]') !== null ||
              target.closest('.leaflet-control') !== null) {
            console.log('🔒 Click ignorado - fue en un control/button');
            return;
          }
        }
        
        const { lat, lng } = e.latlng;
        const newPoint: [number, number] = [lat, lng];
        const newPoints = [...points, newPoint];
        setPoints(newPoints);

        // Agregar marcador en el punto
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #ffd700; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 0 2px #ffd700;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })
        }).addTo(map);
        markersRef.current.push(marker);

        // Si hay al menos 3 puntos, dibujar el polígono
        if (newPoints.length >= 3) {
          // Cerrar el polígono conectando el último punto con el primero
          const closedPoints = [...newPoints, newPoints[0]];
          
          // Remover polígono anterior si existe
          if (polygonRef.current) {
            map.removeLayer(polygonRef.current);
          }

          // Crear nuevo polígono temporal (mientras dibujas)
          const polygon = L.polygon(closedPoints, {
            color: '#ffd700',
            weight: 3,
            fillColor: '#ffd700',
            fillOpacity: 0.2,
          }).addTo(map);
          polygonRef.current = polygon;
          setCurrentPolygon(closedPoints);
        }
      },
    });
    return null;
  }

  useEffect(() => {
    return () => {
      // Limpiar marcadores y polígono al desmontar
      markersRef.current.forEach(marker => map.removeLayer(marker));
      if (polygonRef.current) {
        map.removeLayer(polygonRef.current);
      }
    };
  }, [map]);

  const handleStartDrawing = () => {
    setPoints([]);
    setIsDrawing(true);
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
  };

  const handleFinishDrawing = (e?: React.MouseEvent) => {
    console.log('🎯🎯🎯 handleFinishDrawing EJECUTADO 🎯🎯🎯');
    console.log('🎯 Puntos actuales:', points.length);
    console.log('🎯 Estado isDrawing:', isDrawing);
    
    // Prevenir propagación del evento si viene de un click
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
    
    // Guardar los puntos actuales ANTES de cambiar cualquier estado
    const currentPointsSnapshot = [...points];
    console.log('🎯 Snapshot de puntos:', currentPointsSnapshot.length);
    
    if (currentPointsSnapshot.length < 3) {
      console.warn('⚠️ No hay suficientes puntos:', currentPointsSnapshot.length);
      alert('Necesitas al menos 3 puntos para crear un polígono');
      return;
    }
    
    console.log('✅ Tiene suficientes puntos, continuando...');

    // Marcar que estamos procesando para evitar clicks adicionales
    isProcessingRef.current = true;
    
    // Desactivar modo dibujo inmediatamente para evitar más clicks
    setIsDrawing(false);
    
    // Pequeño delay para asegurar que React haya procesado el cambio de estado
    requestAnimationFrame(() => {
      // Crear GeoJSON usando la instantánea de los puntos (no el estado actual)
      const closedPoints = [...currentPointsSnapshot, currentPointsSnapshot[0]]; // Cerrar el polígono
      const coordinates = closedPoints.map(p => [p[1], p[0]]); // Convertir a [lng, lat]
      
      const geoJSON = {
        type: 'Polygon' as const,
        coordinates: [coordinates]
      };

      // Calcular área
      console.log('🔍 Calculando área del polígono...');
      console.log('📐 Puntos del polígono:', currentPointsSnapshot.length);
      console.log('🗺️ GeoJSON:', JSON.stringify(geoJSON, null, 2));
      
      let polygonArea = 0;
      let areaEnHectareas = 0;
      
      try {
        // Crear un Feature para @turf/turf
        const feature = {
          type: 'Feature' as const,
          geometry: geoJSON,
          properties: {}
        };
        
        console.log('📐 Feature para cálculo:', JSON.stringify(feature, null, 2));
        
        // Calcular área en m²
        polygonArea = area(feature); 
        console.log('📏 Área en m²:', polygonArea);
        
        // Convertir a hectáreas (1 hectárea = 10,000 m²)
        areaEnHectareas = polygonArea / 10000;
        console.log('📏 Área en hectáreas:', areaEnHectareas);
        console.log('📏 Tipo de área:', typeof areaEnHectareas);
        console.log('📏 Es finito?', isFinite(areaEnHectareas));
        
        if (!isFinite(areaEnHectareas) || isNaN(areaEnHectareas) || areaEnHectareas <= 0) {
          console.error('❌ Área inválida calculada:', areaEnHectareas);
          console.error('❌ Polygon area (m²):', polygonArea);
          alert('Error al calcular el área del polígono. Por favor, intenta dibujar nuevamente.');
          isProcessingRef.current = false;
          return;
        }
        
        console.log('✅ Área calculada correctamente:', areaEnHectareas, 'hectáreas');
      } catch (error) {
        console.error('❌ Error al calcular área:', error);
        console.error('❌ Stack:', (error as Error).stack);
        alert('Error al calcular el área del polígono. Por favor, intenta dibujar nuevamente.');
        isProcessingRef.current = false;
        return;
      }

      // Convertir puntos a formato para mostrar
      const polygonPositions = closedPoints as [number, number][];
      
      // Cambiar el polígono temporal a permanente (más opaco)
      if (polygonRef.current) {
        polygonRef.current.setStyle({
          color: '#ffd700',
          weight: 3,
          fillColor: '#ffd700',
          fillOpacity: 0.4, // Más opaco para indicar que está completado
        });
      }
      
      // Guardar el polígono finalizado
      setCurrentPolygon(polygonPositions);
      
      // Llamar al callback
      console.log('📞 Llamando onPolygonComplete...');
      console.log('📞 Callback existe?', typeof onPolygonComplete === 'function');
      console.log('📞 Área a pasar:', areaEnHectareas);
      console.log('📞 Tipo de área:', typeof areaEnHectareas);
      console.log('📞 GeoJSON a pasar:', JSON.stringify(geoJSON, null, 2));
      
      if (typeof onPolygonComplete === 'function') {
        try {
          // Llamar al callback de forma síncrona
          console.log('🔄 Ejecutando callback...');
          onPolygonComplete(geoJSON, areaEnHectareas);
          console.log('✅ Callback ejecutado exitosamente');
          
          // Verificar que el callback se ejecutó
          console.log('✅✅✅ Área calculada y callback ejecutado:', areaEnHectareas, 'hectáreas');
        } catch (error) {
          console.error('❌ Error al ejecutar callback:', error);
          console.error('❌ Stack del error:', (error as Error).stack);
          alert('Error al guardar el área: ' + (error as Error).message);
        }
      } else {
        console.error('❌ onPolygonComplete no es una función!', typeof onPolygonComplete);
        console.error('❌ onPolygonComplete es:', onPolygonComplete);
        alert('Error: No se pudo guardar el área. El callback no está disponible. Por favor, recarga la página.');
      }
      
      // Permitir clicks nuevamente después de un delay adicional
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
    });
  };

  const handleCancelDrawing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    isProcessingRef.current = true;
    setIsDrawing(false);
    
    setTimeout(() => {
      setPoints([]);
      setCurrentPolygon(null);
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];
      if (polygonRef.current) {
        map.removeLayer(polygonRef.current);
        polygonRef.current = null;
      }
      isProcessingRef.current = false;
    }, 50);
  };

  // Mostrar polígono completado si existe
  useEffect(() => {
    if (completedPolygon && completedPolygon.coordinates && completedPolygon.coordinates[0]) {
      // Convertir GeoJSON a formato Leaflet
      const positions = completedPolygon.coordinates[0].map((coord: number[]) => 
        [coord[1], coord[0]] as [number, number]
      );
      
      if (completedPolygonRef.current) {
        map.removeLayer(completedPolygonRef.current);
      }
      
      const polygon = L.polygon(positions, {
        color: '#ffd700',
        weight: 3,
        fillColor: '#ffd700',
        fillOpacity: 0.4,
      }).addTo(map);
      
      completedPolygonRef.current = polygon;
      
      return () => {
        if (completedPolygonRef.current) {
          map.removeLayer(completedPolygonRef.current);
        }
      };
    }
  }, [completedPolygon, map]);

  if (!editable) return null;

  return (
    <>
      <ClickHandler />
      {currentPolygon && !isDrawing && (
        <Polygon
          positions={currentPolygon}
          pathOptions={{
            color: '#ffd700',
            weight: 3,
            fillColor: '#ffd700',
            fillOpacity: 0.4,
          }}
        />
      )}
      <div 
        onClick={(e) => {
          // Solo detener propagación si el click NO es en un botón
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            e.stopPropagation();
          }
        }}
        onMouseDown={(e) => {
          // Solo detener propagación si el mousedown NO es en un botón
          if ((e.target as HTMLElement).tagName !== 'BUTTON') {
            e.stopPropagation();
          }
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          pointerEvents: 'auto'
        }}
      >
        {!isDrawing ? (
          <button
            onClick={handleStartDrawing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🖊️ Dibujar Polígono
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginBottom: '5px',
              textAlign: 'center'
            }}>
              Clickea en el mapa para agregar puntos ({points.length} puntos)
            </div>
            <button
              type="button"
              onClick={(e) => {
                console.log('🖱️🖱️🖱️ BOTÓN FINALIZAR CLICKEADO 🖱️🖱️🖱️');
                console.log('🖱️ Puntos disponibles:', points.length);
                
                // Detener propagación ANTES de cualquier otra cosa
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                
                // Marcar que estamos procesando inmediatamente para evitar clicks en el mapa
                isProcessingRef.current = true;
                
                // Verificar que tengamos suficientes puntos
                if (points.length < 3) {
                  console.warn('⚠️ No hay suficientes puntos:', points.length);
                  isProcessingRef.current = false;
                  alert('Necesitas al menos 3 puntos para crear un polígono');
                  return;
                }
                
                console.log('🖱️ Llamando handleFinishDrawing...');
                handleFinishDrawing(e);
                console.log('🖱️ handleFinishDrawing retornó');
              }}
              onMouseDown={(e) => {
                // Detener propagación inmediatamente en mousedown
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                // Marcar procesando para evitar que el mapa capture el click
                isProcessingRef.current = true;
              }}
              disabled={points.length < 3}
              style={{
                padding: '8px 16px',
                backgroundColor: points.length >= 3 && !isProcessingRef.current ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: points.length >= 3 && !isProcessingRef.current ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '12px',
                pointerEvents: 'auto',
                zIndex: 1001,
                position: 'relative'
              }}
            >
              ✓ Finalizar ({points.length >= 3 ? 'Listo' : `Faltan ${3 - points.length}`})
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancelDrawing(e);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              ✕ Cancelar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Función para calcular el centro de un polígono
function calcularCentroPoligono(positions: [number, number][]): [number, number] {
  let latSum = 0;
  let lngSum = 0;
  positions.forEach(pos => {
    latSum += pos[0];
    lngSum += pos[1];
  });
  return [latSum / positions.length, lngSum / positions.length];
}

// Componente interno para obtener el zoom y actualizar los labels
function ZoomAwarePolygonLabels({ polygons, mostrarNombres }: { polygons: any[]; mostrarNombres: boolean }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const updateZoom = () => {
      setZoom(map.getZoom());
    };

    map.on('zoomend', updateZoom);
    map.on('zoom', updateZoom);
    
    return () => {
      map.off('zoomend', updateZoom);
      map.off('zoom', updateZoom);
    };
  }, [map]);

  // Calcular tamaño basado en el zoom (zoom típico: 10-18)
  // Zoom menor = texto más pequeño, zoom mayor = texto más grande
  const getFontSize = (currentZoom: number) => {
    // Base: 10px, incremento de 0.5px por nivel de zoom sobre 12
    const baseSize = 10;
    const minZoom = 10;
    const maxZoom = 20;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom));
    const size = baseSize + ((clampedZoom - minZoom) * 0.4);
    return Math.round(size);
  };

  const fontSize = getFontSize(zoom);
  const padding = Math.max(2, Math.round(fontSize * 0.25));
  const iconWidth = Math.max(60, Math.round(fontSize * 7));
  const iconHeight = Math.max(16, Math.round(fontSize * 1.6));

  console.log('🔍 ZoomAwarePolygonLabels: mostrarNombres =', mostrarNombres);
  
  // Si no se deben mostrar los nombres, no renderizar nada
  if (!mostrarNombres) {
    console.log('🚫 No mostrar labels porque mostrarNombres es false');
    return null;
  }

  return (
    <>
      {polygons.map(({ key, geo, centro }) => {
        const polygonColor = geo.color || '#ffff00';
        
        // Crear un icono personalizado para el nombre que se adapta al zoom
        const nombreIcon = L.divIcon({
          html: `<div style="
            background-color: rgba(255, 255, 255, 0.85);
            padding: ${padding}px ${padding * 1.5}px;
            border-radius: 3px;
            border: 1px solid ${polygonColor};
            font-weight: 600;
            font-size: ${fontSize}px;
            color: #222;
            text-align: center;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.15);
            pointer-events: none;
            line-height: 1.2;
          ">${geo.nombre || 'Sin nombre'}</div>`,
          iconSize: [iconWidth, iconHeight],
          iconAnchor: [iconWidth / 2, iconHeight / 2],
          className: 'polygon-label'
        });
        
        return (
          <Marker key={`label-${key}-${mostrarNombres}`} position={centro} icon={nombreIcon} />
        );
      })}
    </>
  );
}

// Componente para mostrar polígonos existentes
function PolygonLayer({ geometrias, onPolygonClick, mostrarNombres = true }: { geometrias: any[]; onPolygonClick?: (geometria: any) => void; mostrarNombres?: boolean }) {
  console.log('🗺️ PolygonLayer: Renderizando', geometrias.length, 'polígonos');
  
  const polygons = geometrias
    .filter(geo => {
      const hasGeometry = geo.geometria && geo.geometria.coordinates && geo.geometria.coordinates.length > 0;
      if (!hasGeometry) {
        console.warn('⚠️ Polígono sin geometría válida:', geo.nombre || geo._id);
      }
      return hasGeometry;
    })
    .map((geo, index) => {
      // Convertir GeoJSON coordinates [[[lng, lat]]] a formato Leaflet [[lat, lng]]
      const coordinates = geo.geometria.coordinates[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
      const centro = calcularCentroPoligono(coordinates);
      console.log(`✅ Polígono ${geo.nombre || index}: color=${geo.color || '#ffff00'}, puntos=${coordinates.length}`);
      return {
        positions: coordinates,
        key: geo._id || `polygon-${index}`,
        geo: geo,
        centro: centro
      };
    });
  
  console.log('🗺️ PolygonLayer: Total de polígonos válidos:', polygons.length);

  return (
    <>
      {/* Renderizar polígonos primero */}
      {polygons.map(({ positions, key, geo }) => {
        const polygonColor = geo.color || '#ffff00';
        
        return (
          <Polygon
            key={key}
            positions={positions}
            pathOptions={{
              color: polygonColor,
              weight: 3,
              fillColor: polygonColor,
              fillOpacity: 0.3,
            }}
            eventHandlers={{
              click: () => {
                if (onPolygonClick) {
                  onPolygonClick(geo);
                }
              },
            }}
          >
            <Popup>
              <div>
                <strong>{geo.nombre}</strong><br/>
                {geo.area ? `Área: ${geo.area.toFixed(2)} ha` : ''}
                {geo.tipoPasto ? `<br/>Pasto: ${geo.tipoPasto}` : ''}
                {geo.sistemaRiego ? `<br/>Riego: ${geo.sistemaRiego}` : ''}
              </div>
            </Popup>
          </Polygon>
        );
      })}
      {/* Renderizar labels con zoom dinámico - renderización condicional en el padre */}
      {mostrarNombres && (
        <ZoomAwarePolygonLabels 
          key={`labels-visible`}
          polygons={polygons} 
          mostrarNombres={true} 
        />
      )}
    </>
  );
}

// Componente para marcar la ubicación de la finca
function FincaMarker({ 
  onLocationSet 
}: { 
  onLocationSet?: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const [fincaLocation, setFincaLocation] = useState<[number, number] | null>(() => {
    if (typeof window !== 'undefined') {
      const savedLat = localStorage.getItem('fincaLat');
      const savedLng = localStorage.getItem('fincaLng');
      if (savedLat && savedLng) {
        return [parseFloat(savedLat), parseFloat(savedLng)];
      }
    }
    return null;
  });
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  // Cargar ubicación guardada al montar
  useEffect(() => {
    if (fincaLocation && !markerRef.current) {
      const marker = L.marker(fincaLocation, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map);
      
      marker.bindPopup('<strong>🏠 Casa Principal de la Finca</strong>');
      markerRef.current = marker;
    }
    
    // Cleanup al desmontar
    return () => {
      if (markerRef.current && !isMarkingMode) {
        // No remover el marcador si solo estamos cambiando el modo
      }
    };
  }, [fincaLocation, map, isMarkingMode]);

  // Manejar clicks para marcar ubicación
  useMapEvents({
    click: (e) => {
      if (isMarkingMode) {
        const { lat, lng } = e.latlng;
        const newLocation: [number, number] = [lat, lng];
        
        // Remover marcador anterior
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        // Crear nuevo marcador
        const marker = L.marker(newLocation, {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(map);
        
        marker.bindPopup('<strong>🏠 Casa Principal de la Finca</strong>').openPopup();
        markerRef.current = marker;
        
        // Guardar en localStorage
        localStorage.setItem('fincaLat', lat.toString());
        localStorage.setItem('fincaLng', lng.toString());
        setFincaLocation(newLocation);
        setIsMarkingMode(false);
        
        // Notificar al callback
        if (onLocationSet) {
          onLocationSet(lat, lng);
        }
        
        // Centrar el mapa en la nueva ubicación
        map.setView(newLocation, map.getZoom());
      }
    }
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        pointerEvents: 'auto'
      }}
    >
      {!fincaLocation ? (
        <button
          onClick={() => setIsMarkingMode(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          🏠 Marcar Casa Principal
        </button>
      ) : (
        <div>
          <button
            onClick={() => setIsMarkingMode(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: isMarkingMode ? '#f59e0b' : '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              marginBottom: '5px',
              width: '100%'
            }}
          >
            {isMarkingMode ? '🖱️ Haz clic en el mapa para marcar' : '✏️ Cambiar Ubicación'}
          </button>
          <button
            onClick={() => {
              if (markerRef.current) {
                map.removeLayer(markerRef.current);
                markerRef.current = null;
              }
              localStorage.removeItem('fincaLat');
              localStorage.removeItem('fincaLng');
              setFincaLocation(null);
              setIsMarkingMode(false);
            }}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '10px',
              width: '100%'
            }}
          >
            🗑️ Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// Vista satelital de Esri World Imagery
const EsriWorldImagery = () => {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      maxZoom={19}
    />
  );
};

interface MapaUbicacionProps {
  onPolygonComplete?: (geojson: any, area: number) => void;
  geometriasExistentes?: any[];
  center?: [number, number];
  zoom?: number;
  editable?: boolean;
  height?: string;
  onPolygonClick?: (geometria: any) => void;
  currentGeometria?: any; // Para mostrar polígono actual mientras se dibuja
  showFincaMarker?: boolean; // Si se muestra el marcador de la finca
  onFincaLocationSet?: (lat: number, lng: number) => void; // Callback cuando se marca la ubicación de la finca
  mostrarNombres?: boolean; // Si se muestran los nombres de las áreas
}

const MapaUbicacion: React.FC<MapaUbicacionProps> = ({
  onPolygonComplete,
  geometriasExistentes = [],
  center = [-34.6037, -58.3816],
  zoom = 13,
  editable = true,
  height = '600px',
  onPolygonClick,
  currentGeometria,
  showFincaMarker = false,
  onFincaLocationSet,
  mostrarNombres: mostrarNombresProp = true,
}) => {
  console.log('🗺️ MapaUbicacion renderizado con', geometriasExistentes?.length || 0, 'geometrías existentes');
  const [isClient, setIsClient] = useState(false);
  const [actualCenter, setActualCenter] = useState<[number, number]>(center);
  const [actualZoom, setActualZoom] = useState<number>(zoom);
  const [mostrarNombres, setMostrarNombres] = useState(mostrarNombresProp);

  useEffect(() => {
    setIsClient(true);
    
    // Cargar ubicación de la finca si existe
    if (typeof window !== 'undefined') {
      const fincaLat = localStorage.getItem('fincaLat');
      const fincaLng = localStorage.getItem('fincaLng');
      if (fincaLat && fincaLng) {
        setActualCenter([parseFloat(fincaLat), parseFloat(fincaLng)]);
        const savedZoom = localStorage.getItem('mapZoom');
        if (savedZoom) {
          setActualZoom(parseInt(savedZoom));
        } else {
          setActualZoom(16); // Zoom más cercano para la casa
        }
      }
    }
  }, []);

  const handleFincaLocationSet = (lat: number, lng: number) => {
    setActualCenter([lat, lng]);
    localStorage.setItem('mapCenterLat', lat.toString());
    localStorage.setItem('mapCenterLng', lng.toString());
    localStorage.setItem('mapZoom', '16');
    setActualZoom(16);
    if (onFincaLocationSet) {
      onFincaLocationSet(lat, lng);
    }
  };

  if (!isClient) {
    return (
      <div style={{ height }} className="bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-300" style={{ height, position: 'relative' }}>
      {/* Botón para mostrar/ocultar nombres */}
      {geometriasExistentes && geometriasExistentes.length > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const nuevoEstado = !mostrarNombres;
            console.log('🔘 Botón clickeado, estado actual:', mostrarNombres, 'nuevo estado:', nuevoEstado);
            setMostrarNombres(nuevoEstado);
          }}
          className="absolute top-2 right-2 z-[1000] bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md border border-gray-300 flex items-center gap-2 transition-colors"
          style={{ zIndex: 1000 }}
          type="button"
        >
          {mostrarNombres ? (
            <>
              <span>👁️</span>
              <span>Ocultar Nombres</span>
            </>
          ) : (
            <>
              <span>👁️‍🗨️</span>
              <span>Mostrar Nombres</span>
            </>
          )}
        </button>
      )}
      <MapContainer
        center={actualCenter}
        zoom={actualZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        key={`map-${actualCenter[0]}-${actualCenter[1]}-${actualZoom}`}
      >
        <EsriWorldImagery />
        {showFincaMarker && (
          <FincaMarker onLocationSet={handleFincaLocationSet} />
        )}
        {/* Mostrar polígonos existentes primero (base del mapa) */}
        {geometriasExistentes && geometriasExistentes.length > 0 && (
          <PolygonLayer 
            geometrias={geometriasExistentes} 
            onPolygonClick={onPolygonClick}
            mostrarNombres={mostrarNombres}
          />
        )}
        {/* Herramientas de dibujo después (sobre las áreas existentes) */}
        {editable && onPolygonComplete && (
          <DrawPolygonTool 
            onPolygonComplete={onPolygonComplete}
            editable={editable}
            completedPolygon={currentGeometria}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapaUbicacion;
