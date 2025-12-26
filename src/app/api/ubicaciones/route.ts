import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ubicacion from '@/models/Ubicacion';
import { requireAuth } from '@/utils/authMiddleware';
import { area } from '@turf/turf';

// GET - Obtener todas las ubicaciones del usuario
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const activa = searchParams.get('activa');
    const estado = searchParams.get('estado');

    const filtros: Record<string, unknown> = {
      userId: user.userId,
      activa: true // Por defecto solo activas
    };

    if (activa !== null) filtros.activa = activa === 'true';
    if (estado) filtros.estado = estado;

    const ubicaciones = await Ubicacion.find(filtros)
      .sort({ nombre: 1 })
      .lean();

    return NextResponse.json({ ubicaciones });
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva ubicación
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const body = await request.json();

    console.log('📥 Datos recibidos:', JSON.stringify(body, null, 2));

    // Validar campos requeridos
    if (!body.nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar que no exista una ubicación con el mismo nombre para este usuario
    const ubicacionExistente = await Ubicacion.findOne({
      userId: user.userId,
      nombre: body.nombre,
      activa: true
    });

    if (ubicacionExistente) {
      return NextResponse.json(
        { error: 'Ya existe una ubicación con este nombre' },
        { status: 400 }
      );
    }

    // Preparar los datos, asegurando que geometria tenga el formato correcto
    const datosUbicacion: any = {
      nombre: body.nombre,
      tipo: body.tipo || 'potrero',
      userId: user.userId,
      estado: body.estado || 'activa',
      activa: body.activa !== undefined ? body.activa : true,
    };

    // Agregar campos opcionales
    if (body.capacidad) datosUbicacion.capacidad = body.capacidad;
    if (body.descripcion) datosUbicacion.descripcion = body.descripcion;
    if (body.tipoPasto) datosUbicacion.tipoPasto = body.tipoPasto;
    if (body.sistemaRiego) datosUbicacion.sistemaRiego = body.sistemaRiego;
    // Color: SIEMPRE guardar, usar el proporcionado (validado) o el valor por defecto
    if (body.color && body.color.trim() !== '' && body.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      datosUbicacion.color = body.color.trim();
      console.log('🎨 Color válido recibido:', body.color);
    } else {
      datosUbicacion.color = '#ffff00';
      console.log('🎨 Color inválido o vacío, usando por defecto:', datosUbicacion.color);
    }
    console.log('🎨 Guardando ubicación con color:', datosUbicacion.color);
    if (body.caracteristicas && Array.isArray(body.caracteristicas)) {
      datosUbicacion.caracteristicas = body.caracteristicas;
    }

    // Agregar geometría si existe y calcular área
    if (body.geometria) {
      // Validar formato GeoJSON
      if (body.geometria.type === 'Polygon' && body.geometria.coordinates) {
        datosUbicacion.geometria = {
          type: 'Polygon',
          coordinates: body.geometria.coordinates
        };
        console.log('✅ Geometría validada y agregada');
        
        // Calcular área desde la geometría (siempre calcular desde la geometría para asegurar precisión)
        try {
          const areaCalculada = area(body.geometria); // m²
          const areaEnHectareas = areaCalculada / 10000;
          datosUbicacion.area = parseFloat(areaEnHectareas.toFixed(4));
          console.log('📏 Área calculada desde geometría:', datosUbicacion.area, 'hectáreas');
          console.log('📏 Área en m²:', areaCalculada);
        } catch (error) {
          console.error('❌ Error al calcular área desde geometría:', error);
          // Si hay error, intentar usar el área del body si existe
          if (body.area) {
            const areaBody = parseFloat(body.area);
            if (!isNaN(areaBody) && areaBody > 0) {
              datosUbicacion.area = areaBody;
              console.log('📏 Usando área del body:', datosUbicacion.area);
            }
          }
        }
      } else {
        console.warn('⚠️ Formato de geometría inválido:', body.geometria);
        // Si hay geometría inválida pero hay área en el body, usarla
        if (body.area) {
          const areaBody = parseFloat(body.area);
          if (!isNaN(areaBody) && areaBody > 0) {
            datosUbicacion.area = areaBody;
            console.log('📏 Usando área del body (geometría inválida):', datosUbicacion.area);
          }
        }
      }
    } else {
      // Si no hay geometría, usar el área del body si existe
      if (body.area) {
        const areaBody = parseFloat(body.area);
        if (!isNaN(areaBody) && areaBody > 0) {
          datosUbicacion.area = areaBody;
          console.log('📏 Usando área del body (sin geometría):', datosUbicacion.area);
        }
      }
    }

    // Agregar coordenadas manuales si existen
    if (body.coordenadas && Array.isArray(body.coordenadas)) {
      datosUbicacion.coordenadas = body.coordenadas;
    }

    console.log('💾 Guardando ubicación:', JSON.stringify(datosUbicacion, null, 2));

    const nuevaUbicacion = new Ubicacion(datosUbicacion);
    const ubicacionGuardada = await nuevaUbicacion.save();

    console.log('✅ Ubicación guardada exitosamente');

    return NextResponse.json(ubicacionGuardada, { status: 201 });
  } catch (error) {
    console.error('❌ Error al crear ubicación:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack:', error.stack);
      
      if (error.message === 'No autorizado') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      
      // Retornar el mensaje de error específico
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

