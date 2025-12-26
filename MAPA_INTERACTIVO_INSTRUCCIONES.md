# 🗺️ Instrucciones: Mapa Interactivo de Potreros

## ✅ Implementación Completada

Se ha implementado exitosamente el **Mapa Interactivo** para el módulo de Ubicaciones/Potreros con las siguientes funcionalidades:

---

## 📦 Paquetes Instalados

```bash
npm install react-leaflet leaflet leaflet-draw @turf/turf @types/leaflet @types/leaflet-draw
```

---

## 🎯 Funcionalidades Implementadas

### 1. **Vista Satelital por Defecto**
   - ✅ El mapa carga con **Esri World Imagery** (vista satelital real)
   - ✅ Ideal para delimitar fincas y potreros

### 2. **Herramientas de Dibujo**
   - ✅ Herramienta de polígono en la esquina superior derecha
   - ✅ Permite dibujar polígonos directamente sobre el mapa satelital
   - ✅ Polígonos dibujados se destacan en **amarillo/dorado** para visibilidad

### 3. **Cálculo Automático de Área**
   - ✅ Usa `@turf/turf` para calcular el área en metros cuadrados
   - ✅ Convierte automáticamente a **hectáreas**
   - ✅ El área se rellena automáticamente en el formulario

### 4. **Entrada Manual de Coordenadas**
   - ✅ Alternativa a dibujar en el mapa
   - ✅ Permite ingresar coordenadas manualmente (Lat/Lng)
   - ✅ Mínimo 3 puntos para formar un polígono
   - ✅ Botón "Calcular Área" para procesar las coordenadas

### 5. **Nuevos Campos en el Formulario**
   - ✅ **Tipo de Pasto**: Campo de texto libre
   - ✅ **Sistema de Riego**: Select con opciones:
     - Aspersión
     - Inundación
     - Lluvia/Temporal
   - ✅ **Área**: Se calcula automáticamente (editable manualmente)

### 6. **Visualización de Polígonos Guardados**
   - ✅ Todos los potreros guardados se muestran en el mapa
   - ✅ Polígonos en **amarillo brillante** para destacar sobre la imagen satelital
   - ✅ Popups al hacer clic mostrando nombre y área
   - ✅ Click en polígono permite editar la ubicación

### 7. **Modelo de Datos Actualizado**
   - ✅ Modelo `Ubicacion.ts` ahora incluye:
     - `geometria`: GeoJSON Polygon
     - `coordenadas`: Array de coordenadas manuales (opcional)
     - `tipoPasto`: Tipo de pasto
     - `sistemaRiego`: Sistema de riego
   - ✅ Índice geoespacial 2dsphere para consultas espaciales

---

## 📁 Archivos Modificados/Creados

### Archivos Nuevos:
- `src/components/MapaUbicacion.tsx` - Componente principal del mapa

### Archivos Modificados:
- `src/models/Ubicacion.ts` - Modelo actualizado con GeoJSON
- `src/components/FormularioUbicacion.tsx` - Formulario con mapa integrado
- `src/components/GestionUbicacionesApp.tsx` - Vista con mapa de visualización
- `src/app/globals.css` - Estilos CSS de Leaflet agregados

---

## 🚀 Cómo Usar

### Para el Usuario Final:

1. **Crear Nueva Ubicación con Mapa:**
   - Ir a **Ubicaciones** en el menú
   - Click en "**+ Nueva Ubicación**"
   - Seleccionar "**🗺️ Dibujar en el Mapa**"
   - Usar la herramienta de polígono (ícono en esquina superior derecha del mapa)
   - Dibujar el área del potrero sobre la imagen satelital
   - El área se calcula automáticamente
   - Completar los demás campos (nombre, tipo de pasto, sistema de riego, etc.)
   - Guardar

2. **Crear con Coordenadas Manuales:**
   - Seleccionar "**📍 Coordenadas Manuales**"
   - Ingresar al menos 3 puntos (latitud, longitud)
   - Click en "**Calcular Área**"
   - Completar formulario y guardar

3. **Ver Todas las Ubicaciones en el Mapa:**
   - En la vista de ubicaciones, click en "**🗺️ Ver Mapa**"
   - Todos los potreros con geometría se mostrarán
   - Click en cualquier polígono para ver detalles y editar

---

## ⚙️ Configuración

### Cambiar la Ubicación por Defecto del Mapa

Para cambiar las coordenadas iniciales del mapa (centro y zoom), edita estos valores:

**En `FormularioUbicacion.tsx` (línea ~250):**
```typescript
center={[-34.6037, -58.3816]} // Cambiar por tus coordenadas [lat, lng]
zoom={15} // Ajustar nivel de zoom
```

**En `GestionUbicacionesApp.tsx` (línea ~200):**
```typescript
center={[-34.6037, -58.3816]} // Cambiar por tus coordenadas
zoom={13}
```

**En `MapaUbicacion.tsx` (línea ~180):**
```typescript
center = [-34.6037, -58.3816] // Cambiar por tus coordenadas por defecto
```

---

## 🔧 Estructura de Datos GeoJSON

Los polígonos se guardan en formato **GeoJSON** estándar:

```json
{
  "geometria": {
    "type": "Polygon",
    "coordinates": [
      [
        [-58.3816, -34.6037],  // [longitud, latitud]
        [-58.3800, -34.6037],
        [-58.3800, -34.6020],
        [-58.3816, -34.6020],
        [-58.3816, -34.6037]   // Último punto igual al primero (polígono cerrado)
      ]
    ]
  }
}
```

---

## 🐛 Solución de Problemas

### El mapa no carga:
1. Verificar que los paquetes estén instalados: `npm install`
2. Verificar que los CSS de Leaflet estén en `globals.css`
3. Limpiar caché del navegador

### Las herramientas de dibujo no aparecen:
1. Asegurarse de estar en modo "Dibujar en el Mapa"
2. Verificar que el mapa esté completamente cargado
3. Revisar la consola del navegador para errores

### El área no se calcula:
1. Verificar que el polígono esté completamente cerrado
2. Para coordenadas manuales, asegurarse de tener al menos 3 puntos
3. Click en "Calcular Área" si usas coordenadas manuales

---

## 📝 Notas Técnicas

- **Leaflet-Draw** se carga dinámicamente para evitar problemas SSR
- Los estilos CSS se importan en `globals.css`
- El componente usa **dynamic import** para evitar errores de hidratación
- Los polígonos se almacenan en formato GeoJSON estándar
- El cálculo de área usa la fórmula de Gauss (implementada en Turf.js)

---

## 🎨 Personalización

### Cambiar el Color de los Polígonos

**En `MapaUbicacion.tsx`:**

Para polígonos nuevos (línea ~70):
```typescript
color: '#ffd700', // Cambiar color
fillColor: '#ffd700', // Cambiar color de relleno
```

Para polígonos existentes (línea ~145):
```typescript
color: '#ffff00', // Cambiar color
fillColor: '#ffff00', // Cambiar color de relleno
```

---

## ✅ Próximas Mejoras Sugeridas

1. **Edición de polígonos existentes** directamente en el mapa
2. **Búsqueda de ubicación** por dirección o coordenadas
3. **Múltiples capas** (diferentes colores por tipo de potrero)
4. **Medición de distancias** entre puntos
5. **Exportación de mapas** como imagen
6. **Superposición de datos** (vacaciones, producción por potrero)

---

¡El mapa interactivo está listo para usar! 🎉



