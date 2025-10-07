# Configuración de la Aplicación de Registro de Vacas

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# MongoDB Connection String
# Reemplaza con tu string de conexión de MongoDB
MONGODB_URI=mongodb://localhost:27017/registro-vacas

# Si usas MongoDB Atlas, el string sería algo como:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/registro-vacas?retryWrites=true&w=majority
```

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura MongoDB:
   - Opción 1: Instala MongoDB localmente
   - Opción 2: Usa MongoDB Atlas (recomendado para producción)

3. Ejecuta la aplicación:
```bash
npm run dev
```

## Características de las Vacas

La aplicación permite registrar las siguientes características de cada vaca:

### Identificación General
- Número de Identificación
- Nombre
- Fecha de Nacimiento
- Sexo

### Características Físicas
- Raza
- Color del Pelaje
- Peso
- Altura a la Cruz
- Características Distintivas

### Información Reproductiva
- Estado Reproductivo
- Historial de Partos
- Última Fecha de Servicio

### Producción
- Producción Lechera Diaria
- Ganancia de Peso

### Salud y Bienestar
- Historial Médico
- Condición Corporal
- Observaciones de Comportamiento

### Ubicación y Manejo
- Ubicación Actual
- Historial de Movimientos
- Alimentación

### Información Genética
- Padre
- Madre
- Registro Genealógico

### Datos Económicos
- Costo de Adquisición
- Valor Estimado
- Costos Asociados

