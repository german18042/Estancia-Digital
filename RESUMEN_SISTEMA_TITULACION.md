# 📊 Sistema de Gestión Ganadera Integral
## Resumen Ejecutivo para Trabajo de Titulación

---

## 🎯 1. DESCRIPCIÓN GENERAL

El **Sistema de Gestión Ganadera Integral** es una aplicación web completa desarrollada para la administración, seguimiento y control integral de explotaciones ganaderas bovinas. El sistema permite gestionar de manera eficiente y digitalizada todos los aspectos críticos de una finca ganadera moderna, desde el registro de animales hasta el análisis de producción y trazabilidad completa.

### Objetivo Principal
Facilitar la gestión digital de fincas ganaderas mediante una plataforma web intuitiva que centraliza el registro de información ganadera, optimiza los procesos administrativos y proporciona herramientas analíticas para la toma de decisiones basada en datos.

---

## 🏗️ 2. ARQUITECTURA Y TECNOLOGÍAS

### Stack Tecnológico

#### Frontend
- **Next.js 16.1.1** (App Router) - Framework React de última generación
- **React 19.2.3** - Biblioteca de interfaz de usuario
- **TypeScript 5** - Tipado estático para mayor robustez
- **Tailwind CSS 4** - Framework de estilos utility-first
- **Turbopack** - Herramienta de construcción rápida
- **React Leaflet** - Componentes React para mapas interactivos
- **Leaflet** - Biblioteca de mapas open-source
- **Turf.js** - Biblioteca de análisis geoespacial

#### Backend
- **Next.js API Routes** - API RESTful integrada
- **MongoDB** - Base de datos NoSQL
- **Mongoose 8.19.0** - ODM para MongoDB
- **JSON Web Tokens (JWT)** - Autenticación segura
- **bcryptjs** - Hash de contraseñas

#### Herramientas de Desarrollo
- **ESLint 9** - Linter para calidad de código
- **PostCSS** - Procesamiento de CSS
- **Git** - Control de versiones

### Arquitectura del Sistema

El sistema sigue una **arquitectura de aplicación web moderna** con separación clara entre:

1. **Capa de Presentación**: Componentes React reutilizables (30+ componentes)
2. **Capa de Lógica de Negocio**: API Routes de Next.js
3. **Capa de Datos**: Modelos Mongoose con MongoDB
4. **Capa de Autenticación**: Sistema JWT con contexto React

---

## 📦 3. MODELOS DE DATOS (8 Modelos Principales)

### 3.1. Usuario
Gestiona la autenticación y autorización del sistema.
- **Campos**: nombre, email, password (hasheado), rol, activo, último acceso
- **Roles**: Administrador, Usuario
- **Funcionalidades**: Autenticación JWT, control de acceso, aislamiento de datos

### 3.2. Vaca (Modelo Principal - 94 campos)
Modelo central del sistema con información completa de cada animal.
- **Identificación**: Número único, nombre, fecha de nacimiento, sexo
- **Características Físicas**: Raza, color, peso, altura, características distintivas
- **Reproducción**: Estado reproductivo, historial de partos, última fecha de servicio, padre, madre
- **Producción**: Producción lechera diaria, ganancia de peso
- **Salud**: Historial médico completo, condición corporal, observaciones
- **Ubicación**: Ubicación actual, historial de movimientos, lote asignado
- **Económicos**: Costo de adquisición, valor estimado, costos asociados
- **Gestión**: Estados (activa, inactiva, vendida), motivo de inactivación, fecha de salida

### 3.3. Gestación
Seguimiento completo del ciclo gestacional de cada vaca.
- **Información del Servicio**: Tipo (monta natural, IA, transferencia embrionaria), fecha, toro/padre
- **Cálculo Automático**: Fecha probable de parto (283 días), días de gestación actuales, trimestre
- **Seguimiento**: Historial de gestación con observaciones, peso, exámenes veterinarios
- **Estados**: En gestación, parto exitoso, aborto, parto difícil, complicaciones
- **Alertas**: Identificación de partos críticos (0-14 días), próximos partos

### 3.4. Producción Lechera
Registro detallado de la producción diaria de leche.
- **Registro por Ordeños**: Mañana, tarde, noche (volúmenes individuales)
- **Cálculo Automático**: Total diario, promedios, estadísticas
- **Calidad**: Grasa, proteína, células somáticas
- **Análisis**: Detección de anomalías, identificación de top productoras
- **Reportes**: Producción por período, tendencias, gráficos

### 3.5. Registro Sanitario
Gestión completa de la salud animal.
- **Tipos de Procedimientos**: Vacunas, desparasitaciones, tratamientos, revisiones, cirugías
- **Seguimiento**: Fechas de aplicación, próximas fechas programadas
- **Días de Retiro**: Control de período de retiro para medicamentos
- **Alertas**: Procedimientos vencidos, próximos procedimientos
- **Historial Completo**: Registro médico por vaca

### 3.6. Lote
Agrupación de animales para gestión organizada.
- **Información**: Nombre, descripción, capacidad, fecha de creación
- **Gestión**: Asignación de vacas a lotes, cambios de lote con historial
- **Estadísticas**: Cantidad de animales por lote, ocupación

### 3.7. Ubicación/Potrero
Gestión de ubicaciones físicas con mapa interactivo.
- **Información General**: Nombre, tipo (potrero, corral, establo), descripción
- **Características**: Tipo de pasto, sistema de riego (aspersión, inundación, lluvia temporal)
- **Geometría GeoJSON**: Polígonos almacenados en formato estándar GeoJSON
- **Cálculo de Área**: Área automática en hectáreas
- **Visualización**: Mapa interactivo con vista satelital

### 3.8. Producción Finca
Registro de producción general de la finca.
- **Producción Total**: Registro de producción agregada
- **Análisis**: Tendencias de producción general

---

## 🎨 4. MÓDULOS Y FUNCIONALIDADES PRINCIPALES

### 4.1. Módulo de Registro de Vacas

**Funcionalidades:**
- ✅ Registro completo con 20+ campos de información
- ✅ Validación de número de identificación único por usuario
- ✅ Formulario intuitivo con validación en tiempo real
- ✅ Historial completo: partos, movimientos, médicos
- ✅ Genealogía: registro de padre y madre
- ✅ Estados reproductivos dinámicos
- ✅ Seguimiento económico (costos, valores)
- ✅ Búsqueda avanzada por múltiples criterios
- ✅ Gestión de estados (activa, inactiva, vendida)
- ✅ Vista detallada de cada animal

**Características Técnicas:**
- Formulario con más de 90 campos organizados por secciones
- Validación TypeScript en frontend y backend
- Paginación en listados para mejor rendimiento
- Índices optimizados en base de datos

### 4.2. Módulo de Gestión de Gestación

**Funcionalidades:**
- ✅ Registro de servicio (monta, inseminación artificial, transferencia)
- ✅ Confirmación de gestación con diferentes métodos
- ✅ Cálculo automático de fecha probable de parto
- ✅ Seguimiento por trimestres gestacionales
- ✅ Historial de gestación (peso, observaciones, exámenes)
- ✅ Alertas de partos próximos y críticos
- ✅ Registro de parto con detalles completos
- ✅ Estados de gestación (en curso, exitosa, aborto, complicaciones)
- ✅ Trazabilidad completa del ciclo reproductivo

**Características Técnicas:**
- Cálculos automáticos basados en períodos gestacionales estándar
- Alertas visuales con código de colores (rojo: crítico, amarillo: próximo)
- Integración con módulo de vacas para actualización automática de estados

### 4.3. Módulo de Producción Lechera

**Funcionalidades:**
- ✅ Registro por ordeños (mañana, tarde, noche)
- ✅ Cálculo automático de total diario y promedios
- ✅ Indicadores de calidad (grasa, proteína, células somáticas)
- ✅ Detección de anomalías en producción
- ✅ Estadísticas y reportes detallados
- ✅ Identificación de top 5 productoras
- ✅ Gráficos de producción (últimos 7 días, últimos 30 días)
- ✅ Filtros avanzados por fecha, vaca, lote

**Características Técnicas:**
- Cálculos automáticos en backend
- Visualizaciones gráficas interactivas
- Agregaciones optimizadas en MongoDB
- Exportación de datos para análisis externo

### 4.4. Módulo de Gestión Sanitaria

**Funcionalidades:**
- ✅ Registro de múltiples tipos de procedimientos
  - Vacunas
  - Desparasitaciones
  - Tratamientos médicos
  - Revisiones veterinarias
  - Cirugías
- ✅ Seguimiento de fechas de aplicación y próximas fechas
- ✅ Control de días de retiro para medicamentos
- ✅ Alertas de procedimientos vencidos y próximos
- ✅ Historial médico completo por vaca
- ✅ Recordatorios automáticos

**Características Técnicas:**
- Sistema de alertas inteligente
- Cálculos automáticos de fechas de revacunación
- Integración con dashboard para alertas centralizadas

### 4.5. Módulo de Trazabilidad

**Funcionalidades:**
- ✅ Historial completo de movimientos de ubicación
- ✅ Seguimiento completo de gestaciones
- ✅ Historial médico completo
- ✅ Historial de producción
- ✅ Genealogía (padre, madre, ancestros)
- ✅ Vista cronológica de eventos
- ✅ Búsqueda por eventos específicos

**Características Técnicas:**
- Agregaciones complejas en MongoDB
- Visualización temporal de eventos
- Consultas optimizadas con índices

### 4.6. Módulo de Gestión de Ubicaciones y Potreros

**Funcionalidades:**
- ✅ **Mapa Interactivo** con vista satelital (Esri World Imagery)
- ✅ **Dibujo de Polígonos** directamente sobre el mapa
- ✅ **Cálculo Automático de Área** en hectáreas usando análisis geoespacial
- ✅ **Entrada Manual de Coordenadas** como alternativa
- ✅ **Visualización de Todos los Potreros** en el mapa
- ✅ **Asignación de Colores Personalizados** a cada área
- ✅ **Nombres en el Mapa** con visibilidad configurable
- ✅ **Etiquetas Adaptativas** que se ajustan al nivel de zoom
- ✅ Información detallada: tipo de pasto, sistema de riego
- ✅ Historial de cambios de ubicación de animales

**Características Técnicas:**
- Integración con Leaflet para mapas interactivos
- Almacenamiento en formato GeoJSON estándar
- Índices geoespaciales 2dsphere para consultas espaciales
- Cálculo de áreas usando la fórmula de Gauss (Turf.js)
- Componentes React optimizados para rendimiento

### 4.7. Módulo de Gestión de Lotes

**Funcionalidades:**
- ✅ Creación y gestión de lotes
- ✅ Asignación de vacas a lotes
- ✅ Cambio de lote con historial
- ✅ Visualización de animales por lote
- ✅ Control de capacidad de lotes
- ✅ Estadísticas por lote

### 4.8. Módulo de Dashboard Analítico

**Funcionalidades:**
- ✅ **KPIs Principales**:
  - Total de vacas (activas/inactivas)
  - Vacas gestantes
  - Vacas lactantes
  - Partos críticos (0-14 días)
  - Procedimientos sanitarios pendientes/vencidos
- ✅ **Gráficos Interactivos**:
  - Producción lechera últimos 7 días (gráfico de barras)
  - Top 5 productoras (últimos 30 días)
  - Próximos partos con días restantes
  - Próximos procedimientos sanitarios
- ✅ **Alertas Visuales**:
  - Partos críticos destacados
  - Procedimientos vencidos
  - Código de colores (rojo: crítico, amarillo: próximo)
- ✅ **Vista Consolidada**: Información de todos los módulos en un solo lugar

**Características Técnicas:**
- Agregaciones optimizadas en MongoDB
- Cálculos en tiempo real
- Visualizaciones responsivas
- Actualización automática de datos

### 4.9. Módulo de Administración

**Funcionalidades:**
- ✅ Gestión de usuarios (crear, editar, desactivar)
- ✅ Control de roles (administrador/usuario)
- ✅ Inicialización de usuarios
- ✅ Aislamiento de datos por usuario (multi-tenant)
- ✅ Panel de administración completo

---

## 🔐 5. SEGURIDAD Y AUTENTICACIÓN

### Sistema de Autenticación
- **JWT (JSON Web Tokens)**: Tokens seguros para sesiones
- **Passwords Hasheados**: Uso de bcryptjs con salt rounds
- **Cookies HttpOnly**: Prevención de ataques XSS
- **Validación de Usuario Activo**: Solo usuarios activos pueden acceder
- **Aislamiento de Datos**: Cada usuario solo accede a sus propios datos (userId en todas las consultas)

### Control de Acceso
- **Roles**: Administrador y Usuario
- **Rutas Protegidas**: Middleware de autenticación en todas las rutas API
- **Context API**: Manejo de estado de autenticación en frontend

---

## 🌐 6. API RESTFUL

El sistema expone **40+ endpoints REST** organizados por módulos:

### Autenticación (`/api/auth/`)
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `GET /api/auth/me` - Información del usuario actual

### Vacas (`/api/vacas/`)
- `GET /api/vacas` - Listar vacas (con paginación y filtros)
- `POST /api/vacas` - Crear nueva vaca
- `GET /api/vacas/[id]` - Obtener vaca por ID
- `PUT /api/vacas/[id]` - Actualizar vaca
- `DELETE /api/vacas/[id]` - Marcar como inactiva
- `POST /api/vacas/buscar` - Búsqueda avanzada
- `GET /api/vacas/estadisticas` - Estadísticas generales

### Gestación (`/api/gestacion/`)
- CRUD completo de gestaciones
- `GET /api/gestacion/estadisticas` - Estadísticas de gestación
- `GET /api/gestacion/trazabilidad/[vacaId]` - Trazabilidad de gestación

### Producción Lechera (`/api/produccion-lechera/`)
- CRUD de registros de producción
- `GET /api/produccion-lechera/estadisticas` - Análisis de producción

### Registros Sanitarios (`/api/registros-sanitarios/`)
- CRUD de registros sanitarios
- `GET /api/registros-sanitarios/proximosrocedimientos` - Próximos procedimientos

### Dashboard (`/api/dashboard`)
- Agregación de datos de todos los módulos
- KPIs principales
- Próximos eventos

### Otros Módulos
- `/api/lotes` - Gestión de lotes
- `/api/ubicaciones` - Gestión de ubicaciones (con GeoJSON)
- `/api/usuarios` - Gestión de usuarios (admin)
- `/api/produccion-finca` - Producción general

---

## 📊 7. INTERFAZ DE USUARIO

### Características de Diseño

**Responsive Design:**
- ✅ Diseño mobile-first
- ✅ Adaptación a tablets y desktop
- ✅ Menú hamburguesa en dispositivos móviles
- ✅ Tablas adaptativas con scroll horizontal cuando es necesario

**Experiencia de Usuario (UX):**
- ✅ Mensajes de éxito/error informativos
- ✅ Estados de carga (loading states)
- ✅ Confirmaciones para acciones destructivas
- ✅ Formularios validados en tiempo real
- ✅ Feedback visual inmediato
- ✅ Navegación intuitiva

**Componentes Principales:**
- 30+ componentes React reutilizables
- Diseño consistente con Tailwind CSS
- Iconografía clara y comprensible
- Colores semánticos para estados (éxito, error, advertencia)

---

## 🗺️ 8. FUNCIONALIDADES ESPECIALES

### 8.1. Mapa Interactivo de Potreros

**Características Destacadas:**
- **Vista Satelital**: Imágenes satelitales reales de Esri World Imagery
- **Dibujo de Polígonos**: Herramienta de dibujo punto por punto sobre el mapa
- **Cálculo Automático de Área**: Conversión a hectáreas usando análisis geoespacial
- **Visualización de Todas las Áreas**: Todos los potreros guardados se muestran simultáneamente
- **Colores Personalizables**: Cada área puede tener un color diferente
- **Nombres en el Mapa**: Los nombres de las áreas se muestran dentro de cada polígono
- **Etiquetas Adaptativas al Zoom**: El tamaño del texto se ajusta dinámicamente según el nivel de zoom
- **Control de Visibilidad**: Botón para mostrar/ocultar nombres
- **Marcador de Casa Principal**: Ubicación de referencia de la finca
- **Persistencia de Configuración**: Centro y zoom del mapa se guardan en localStorage

**Tecnologías Utilizadas:**
- Leaflet para renderizado de mapas
- Turf.js para cálculos geoespaciales
- GeoJSON para almacenamiento estándar
- Índices 2dsphere de MongoDB para consultas espaciales

### 8.2. Sistema de Alertas Inteligentes

- Alertas de partos críticos (0-14 días)
- Recordatorios de procedimientos sanitarios
- Notificaciones de vacas próximas a parir
- Procedimientos sanitarios vencidos
- Código de colores para priorización

### 8.3. Cálculos Automáticos

- Edad de animales (años y meses)
- Días de gestación actuales
- Fecha probable de parto
- Días restantes hasta parto
- Total de producción diaria (suma de ordeños)
- Promedios de producción
- Área de polígonos en hectáreas
- Días de retiro para medicamentos

---

## 📈 9. MÉTRICAS Y ESTADÍSTICAS DEL PROYECTO

### Código
- **Modelos de datos**: 8 modelos Mongoose
- **API Routes**: 40+ endpoints REST
- **Componentes React**: 30+ componentes
- **Páginas**: 10+ páginas principales
- **Líneas de código estimadas**: ~15,000-20,000 líneas

### Base de Datos
- **Colecciones**: 8 colecciones principales
- **Índices Optimizados**: 20+ índices para consultas rápidas
- **Índices Geoespaciales**: Para consultas de ubicaciones
- **Relaciones**: Referencias entre colecciones para integridad

### Funcionalidades
- **Campos por Vaca**: 94 campos documentados
- **Tipos de Procedimientos Sanitarios**: 6 tipos
- **Estados de Gestación**: 5 estados
- **Estados Reproductivos**: Múltiples estados dinámicos
- **Formatos de Exportación**: Preparado para futuras implementaciones

---

## 🚀 10. DESPLIEGUE Y PRODUCCIÓN

### Configuración de Producción
- ✅ Despliegue en **Vercel** (plataforma optimizada para Next.js)
- ✅ Conexión a **MongoDB Atlas** (base de datos en la nube)
- ✅ Variables de entorno configuradas
- ✅ Build optimizado para producción
- ✅ Versión actualizada de Next.js (16.1.1) con parches de seguridad

### Optimizaciones Implementadas
- Índices en base de datos para consultas rápidas
- Paginación en listados grandes
- Carga diferida (lazy loading) de componentes pesados
- Optimización de imágenes
- Código minificado y optimizado

---

## 🎓 11. ASPECTOS TÉCNICOS DESTACADOS PARA TITULACIÓN

### Arquitectura Moderna
- **Next.js 16** con App Router: Framework de última generación
- **React 19**: Biblioteca de UI más reciente
- **TypeScript**: Tipado estático para mayor robustez y mantenibilidad
- **Arquitectura Component-Based**: Código modular y reutilizable

### Buenas Prácticas Implementadas
- ✅ Separación de responsabilidades (MVC implícito)
- ✅ TypeScript para type safety
- ✅ Validación tanto en frontend como backend
- ✅ Manejo de errores estructurado
- ✅ Código limpio y documentado
- ✅ Índices optimizados en base de datos
- ✅ Autenticación segura con JWT
- ✅ Aislamiento de datos multi-tenant

### Técnicas Avanzadas Utilizadas
- **GeoJSON y Análisis Geoespacial**: Para mapas y cálculos de área
- **Agregaciones de MongoDB**: Para estadísticas complejas
- **Context API de React**: Para manejo de estado global
- **Dynamic Imports**: Para optimización de carga
- **Server-Side Rendering (SSR)**: Mejor SEO y performance inicial
- **API Routes**: Backend integrado con frontend

---

## 📝 12. CASOS DE USO PRINCIPALES

### Caso de Uso 1: Registro de Nueva Vaca
Un ganadero necesita registrar una nueva vaca en el sistema con toda su información.

**Proceso:**
1. Accede al módulo de Registro de Vacas
2. Completa formulario completo con información (identificación, raza, fecha de nacimiento, etc.)
3. Sistema valida número de identificación único
4. Guarda información en base de datos
5. Vaca aparece en lista principal

### Caso de Uso 2: Seguimiento de Gestación
Un veterinario necesita registrar y seguir una gestación.

**Proceso:**
1. Registra servicio (monta o inseminación)
2. Sistema calcula fecha probable de parto automáticamente
3. Registra confirmación de gestación
4. Sistema actualiza estado reproductivo de la vaca
5. Dashboard muestra alerta cuando se acerca la fecha de parto
6. Registra parto con detalles completos

### Caso de Uso 3: Registro de Producción Lechera Diaria
Un ordeñador registra la producción del día.

**Proceso:**
1. Accede a módulo de Producción Lechera
2. Selecciona vaca y fecha
3. Ingresa producción por cada ordeño (mañana, tarde, noche)
4. Sistema calcula total diario automáticamente
5. Registro se guarda y aparece en estadísticas

### Caso de Uso 4: Gestión de Potreros con Mapa
Un administrador necesita delimitar y registrar un nuevo potrero.

**Proceso:**
1. Accede a módulo de Ubicaciones
2. Selecciona "Dibujar en el Mapa"
3. Dibuja polígono directamente sobre imagen satelital
4. Sistema calcula área automáticamente en hectáreas
5. Completa información (nombre, tipo de pasto, sistema de riego, color)
6. Guarda ubicación
7. Potrero aparece en mapa principal con nombre y color personalizado

### Caso de Uso 5: Consulta de Trazabilidad
Un ganadero necesita ver historial completo de una vaca.

**Proceso:**
1. Busca vaca por número de identificación
2. Accede a módulo de Trazabilidad
3. Visualiza:
   - Historial completo de gestaciones
   - Historial médico
   - Historial de producción
   - Movimientos de ubicación
   - Genealogía (padre, madre)
4. Toda la información se muestra de forma cronológica

### Caso de Uso 6: Revisión de Dashboard
Un administrador revisa el estado general de la finca.

**Proceso:**
1. Accede al Dashboard principal
2. Visualiza KPIs principales:
   - Total de vacas activas
   - Vacas gestantes
   - Partos críticos
   - Procedimientos pendientes
3. Revisa gráficos de producción
4. Identifica alertas importantes (partos próximos, procedimientos vencidos)
5. Toma decisiones basadas en la información consolidada

---

## 🔮 13. POSIBLES MEJORAS FUTURAS

### Corto Plazo
- Exportación de reportes en PDF y Excel
- Sistema de notificaciones push
- Gestión de imágenes de vacas
- Búsqueda avanzada mejorada

### Mediano Plazo
- Aplicación móvil nativa (React Native)
- Sistema de sincronización offline
- Integración con sistemas contables
- Análisis predictivo con IA

### Largo Plazo
- Integración con sensores IoT
- Blockchain para trazabilidad certificada
- Machine Learning para predicción de enfermedades
- Integración con mercados ganaderos

---

## ✅ 14. CONCLUSIONES

El **Sistema de Gestión Ganadera Integral** representa una solución completa y moderna para la digitalización de explotaciones ganaderas. El sistema integra múltiples módulos funcionales en una plataforma única, facilitando la gestión diaria de una finca ganadera.

### Fortalezas del Sistema

1. **Completitud Funcional**: Cubre todos los aspectos críticos de gestión ganadera
2. **Tecnología Moderna**: Utiliza frameworks y bibliotecas de última generación
3. **Escalabilidad**: Arquitectura preparada para crecer
4. **Usabilidad**: Interfaz intuitiva y responsive
5. **Seguridad**: Sistema de autenticación robusto y aislamiento de datos
6. **Trazabilidad**: Seguimiento completo de cada animal
7. **Analítica**: Dashboard con KPIs y visualizaciones
8. **Innovación**: Integración de mapas interactivos y análisis geoespacial

### Impacto en la Gestión Ganadera

- **Digitalización**: Eliminación de registros en papel
- **Eficiencia**: Reducción de tiempo en tareas administrativas
- **Precisión**: Datos centralizados y validados
- **Toma de Decisiones**: Información consolidada para análisis
- **Trazabilidad**: Registro completo para certificaciones y auditorías
- **Productividad**: Alertas y recordatorios automáticos

### Valor Agregado

El sistema no solo digitaliza procesos existentes, sino que agrega valor mediante:
- Cálculos automáticos (fechas, áreas, promedios)
- Alertas inteligentes (partos críticos, procedimientos)
- Visualizaciones analíticas (gráficos, estadísticas)
- Integración de mapas para gestión espacial
- Trazabilidad completa para cumplimiento normativo

---

## 📚 15. REFERENCIAS TÉCNICAS

### Documentación Oficial
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- MongoDB: https://docs.mongodb.com
- Mongoose: https://mongoosejs.com/docs
- Leaflet: https://leafletjs.com
- Tailwind CSS: https://tailwindcss.com/docs

### Estándares Utilizados
- GeoJSON Standard (RFC 7946)
- RESTful API Design
- JWT (JSON Web Tokens) RFC 7519
- TypeScript Language Specification

---

**Versión del Documento**: 1.0  
**Fecha**: Diciembre 2025  
**Autor**: Sistema de Gestión Ganadera Integral  
**Repositorio**: https://github.com/german18042/Estancia-Digital

---

*Este documento proporciona una visión completa del sistema desarrollado para fines de documentación académica y presentación de trabajo de titulación.*


