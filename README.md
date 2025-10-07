# Sistema de Registro de Vacas 🐄

Una aplicación completa desarrollada en **Next.js** con **MongoDB** para el registro y gestión de inventario ganadero.

## 🚀 Características

- **Registro completo de vacas** con más de 20 campos de información
- **Interfaz moderna** con Tailwind CSS
- **Base de datos MongoDB** para almacenamiento persistente
- **API RESTful** para operaciones CRUD
- **Búsqueda y filtrado** de vacas
- **Formularios validados** con TypeScript
- **Responsive design** para uso en móviles y desktop

## 📋 Información que se registra por cada vaca

### Identificación General
- Número de Identificación único
- Nombre (opcional)
- Fecha de Nacimiento
- Sexo (Macho/Hembra)

### Características Físicas
- Raza (Holstein, Jersey, Gir, etc.)
- Color del Pelaje
- Peso (en kg)
- Altura a la Cruz (en cm)
- Características Distintivas

### Información Reproductiva
- Estado Reproductivo (Vacía, Gestante, Lactante, etc.)
- Historial de Partos
- Última Fecha de Servicio
- Información de Padre y Madre

### Producción
- Producción Lechera Diaria (en litros)
- Ganancia de Peso

### Salud y Bienestar
- Historial Médico detallado
- Condición Corporal (escala 1-5)
- Observaciones de Comportamiento

### Ubicación y Manejo
- Ubicación Actual
- Historial de Movimientos
- Información de Alimentación

### Información Genética
- Registro Genealógico

### Datos Económicos
- Costo de Adquisición
- Valor Estimado
- Costos Asociados

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: MongoDB con Mongoose
- **Validación**: TypeScript interfaces
- **API**: Next.js API Routes

## 📦 Instalación

1. **Clona el repositorio**:
```bash
git clone <tu-repositorio>
cd registro-vacas
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Configura las variables de entorno**:
   Crea un archivo `.env.local` en la raíz del proyecto:
```env
MONGODB_URI=mongodb://localhost:27017/registro-vacas
```

   Para MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/registro-vacas?retryWrites=true&w=majority
```

4. **Configura MongoDB**:
   - **Opción 1**: Instala MongoDB localmente
   - **Opción 2**: Usa [MongoDB Atlas](https://www.mongodb.com/atlas) (recomendado)

5. **Ejecuta la aplicación**:
```bash
npm run dev
```

6. **Abre tu navegador** en [http://localhost:3000](http://localhost:3000)

## 🎯 Uso de la Aplicación

1. **Registrar nueva vaca**: Haz clic en "Nueva Vaca" y completa el formulario
2. **Ver lista de vacas**: Todas las vacas registradas aparecen en la tabla principal
3. **Buscar vacas**: Usa el campo de búsqueda para filtrar por número, nombre o raza
4. **Editar vaca**: Haz clic en "Editar" en cualquier fila de la tabla
5. **Eliminar vaca**: Haz clic en "Eliminar" para marcar una vaca como inactiva

## 📊 API Endpoints

- `GET /api/vacas` - Obtener todas las vacas
- `POST /api/vacas` - Crear nueva vaca
- `GET /api/vacas/[id]` - Obtener vaca por ID
- `PUT /api/vacas/[id]` - Actualizar vaca
- `DELETE /api/vacas/[id]` - Eliminar vaca (marcar como inactiva)
- `POST /api/vacas/buscar` - Búsqueda avanzada
- `GET /api/vacas/estadisticas` - Estadísticas generales

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── api/vacas/          # API Routes
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página principal
├── components/
│   ├── FormularioRegistroVaca.tsx
│   ├── ListaVacas.tsx
│   └── RegistroVacasApp.tsx
├── lib/
│   └── mongodb.ts          # Conexión a MongoDB
└── models/
    └── Vaca.ts             # Modelo de datos
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Configura la variable de entorno `MONGODB_URI`
3. Despliega automáticamente

### Otras plataformas
La aplicación es compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación de [Next.js](https://nextjs.org/docs)
2. Consulta la documentación de [MongoDB](https://docs.mongodb.com)
3. Abre un issue en este repositorio

---

Desarrollado con ❤️ para la gestión ganadera moderna
