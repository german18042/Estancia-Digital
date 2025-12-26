import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gestacion from '@/models/Gestacion';
import { requireAuth } from '@/utils/authMiddleware';

/**
 * Calcula todos los valores de gestación basándose en la prioridad:
 * 1. Fecha de confirmación + días confirmados (más preciso)
 * 2. Fecha de servicio (fallback)
 */
function calcularDatosGestacion(params: {
  fechaConfirmacion?: Date | string;
  diasGestacionConfirmados?: number;
  fechaServicio?: Date | string;
}) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
  
  let fechaServicioCalculada: Date;
  let fechaProbableParto: Date;
  let diasGestacionActual: number;
  let trimestreActual: 1 | 2 | 3;

  // PRIORIDAD 1: Usar confirmación veterinaria si existe
  if (params.fechaConfirmacion && params.diasGestacionConfirmados) {
    const fechaConf = new Date(params.fechaConfirmacion);
    fechaConf.setHours(0, 0, 0, 0);
    
    // Calcular fecha de servicio restando los días confirmados
    fechaServicioCalculada = new Date(fechaConf);
    fechaServicioCalculada.setDate(fechaServicioCalculada.getDate() - params.diasGestacionConfirmados);
    
    // Fecha probable de parto: fecha de servicio + 283 días
    fechaProbableParto = new Date(fechaServicioCalculada);
    fechaProbableParto.setDate(fechaProbableParto.getDate() + 283);
    
    // Días actuales: días confirmados + días transcurridos desde confirmación
    const diasDesdeConfirmacion = Math.floor(
      (hoy.getTime() - fechaConf.getTime()) / (1000 * 60 * 60 * 24)
    );
    diasGestacionActual = Math.max(0, params.diasGestacionConfirmados + diasDesdeConfirmacion);
  }
  // PRIORIDAD 2: Usar fecha de servicio si no hay confirmación
  else if (params.fechaServicio) {
    fechaServicioCalculada = new Date(params.fechaServicio);
    fechaServicioCalculada.setHours(0, 0, 0, 0);
    
    // Fecha probable de parto: fecha de servicio + 283 días
    fechaProbableParto = new Date(fechaServicioCalculada);
    fechaProbableParto.setDate(fechaProbableParto.getDate() + 283);
    
    // Días actuales: días desde la fecha de servicio
    diasGestacionActual = Math.max(
      0,
      Math.floor((hoy.getTime() - fechaServicioCalculada.getTime()) / (1000 * 60 * 60 * 24))
    );
  }
  // FALLBACK: Usar fecha actual (caso extremo)
  else {
    fechaServicioCalculada = new Date(hoy);
    fechaProbableParto = new Date(hoy);
    fechaProbableParto.setDate(fechaProbableParto.getDate() + 283);
    diasGestacionActual = 0;
  }

  // Calcular trimestre basado en días actuales
  if (diasGestacionActual <= 94) {
    trimestreActual = 1; // Primer trimestre: 0-94 días
  } else if (diasGestacionActual <= 189) {
    trimestreActual = 2; // Segundo trimestre: 95-189 días
  } else {
    trimestreActual = 3; // Tercer trimestre: 190-283 días
  }

  return {
    fechaServicio: fechaServicioCalculada,
    fechaProbableParto,
    diasGestacionActual,
    trimestreActual
  };
}

// Función para actualizar automáticamente los estados de las gestaciones
async function actualizarEstadosGestaciones(userId: string) {
  try {
    const gestacionesActivas = await Gestacion.find({
      userId,
      activa: true,
      estado: 'en_gestacion'
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const actualizaciones = [];

    for (const gestacion of gestacionesActivas) {
      const fechaParto = new Date(gestacion.fechaProbableParto);
      fechaParto.setHours(0, 0, 0, 0);
      const diasRestantes = Math.ceil((fechaParto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      // Si pasó la fecha de parto y no se ha registrado el parto, mantener en gestación
      // (se mostrará como vencida en el frontend)
      if (diasRestantes < -7) {
        // Más de 7 días después de la fecha probable sin registrar parto
        actualizaciones.push(
          Gestacion.findByIdAndUpdate(gestacion._id, {
            estado: 'en_gestacion',
            fechaActualizacion: new Date()
          })
        );
      }
    }

    if (actualizaciones.length > 0) {
      await Promise.all(actualizaciones);
    }
  } catch (error) {
    console.error('Error al actualizar estados de gestaciones:', error);
  }
}

// GET - Obtener gestaciones del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const estado = searchParams.get('estado');
    const activa = searchParams.get('activa');

    // Construir filtros - siempre incluir userId del usuario
    const filtros: Record<string, unknown> = {
      userId: user.userId, // Solo gestaciones del usuario autenticado
      activa: true // Por defecto, solo mostrar gestaciones activas
    };
    if (estado) filtros.estado = estado;
    if (activa !== null) filtros.activa = activa === 'true'; // Permitir override del filtro

    const skip = (page - 1) * limit;

    // Actualizar estados automáticamente antes de consultar
    await actualizarEstadosGestaciones(user.userId);

    const [gestaciones, total] = await Promise.all([
      Gestacion.find(filtros)
        .sort({ fechaServicio: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Gestacion.countDocuments(filtros)
    ]);

    return NextResponse.json({
      gestaciones,
      paginacion: {
        pagina: page,
        limite: limit,
        total,
        paginas: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener gestaciones:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva gestación
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const body = await request.json();

    // Validar campos requeridos
    const camposRequeridos = [
      'vacaId',
      'numeroIdentificacionVaca',
      'tipoServicio'
    ];

    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `El campo ${campo} es requerido` },
          { status: 400 }
        );
      }
    }

    // Verificar si ya existe una gestación activa para esta vaca del usuario
    const gestacionExistente = await Gestacion.findOne({
      userId: user.userId,
      vacaId: body.vacaId,
      estado: { $in: ['en_gestacion'] },
      activa: true
    });

    if (gestacionExistente) {
      return NextResponse.json(
        { error: 'Esta vaca ya tiene una gestación activa' },
        { status: 400 }
      );
    }

    // Calcular todos los datos de gestación usando la función centralizada
    const datosCalculados = calcularDatosGestacion({
      fechaConfirmacion: body.fechaConfirmacion,
      diasGestacionConfirmados: body.diasGestacionConfirmados,
      fechaServicio: body.fechaServicio
    });

    // Crear nueva gestación con los datos calculados
    const nuevaGestacion = new Gestacion({
      ...body,
      userId: user.userId, // Asociar al usuario autenticado
      fechaServicio: datosCalculados.fechaServicio,
      fechaProbableParto: datosCalculados.fechaProbableParto,
      diasGestacionActual: datosCalculados.diasGestacionActual,
      trimestreActual: datosCalculados.trimestreActual,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date(),
      activa: true,
      estado: 'en_gestacion'
    });

    const gestacionGuardada = await nuevaGestacion.save();

    return NextResponse.json(gestacionGuardada, { status: 201 });
  } catch (error) {
    console.error('Error al crear gestación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
