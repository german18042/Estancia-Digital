import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gestacion from '@/models/Gestacion';
import { requireAuth } from '@/utils/authMiddleware';

// Función para actualizar automáticamente los estados de las gestaciones
async function actualizarEstadosGestaciones(userId: string) {
  try {
    const gestacionesActivas = await Gestacion.find({
      userId,
      activa: true,
      estado: 'en_gestacion'
    });

    const hoy = new Date();
    const actualizaciones = [];

    for (const gestacion of gestacionesActivas) {
      const fechaParto = new Date(gestacion.fechaProbableParto);
      const diasRestantes = Math.ceil((fechaParto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      // Si pasó la fecha de parto y no se ha registrado el parto, marcar como vencida
      if (diasRestantes < -7) {
        // Más de 7 días después de la fecha probable sin registrar parto
        actualizaciones.push(
          Gestacion.findByIdAndUpdate(gestacion._id, {
            estado: 'en_gestacion', // Mantener en gestación pero se mostrará como vencida
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

    // Calcular fecha de servicio y fecha probable de parto
    let fechaServicioCalculada: Date | undefined;
    let fechaProbableParto: Date;
    let diasGestacionActual: number;
    let trimestreActual: number;
    const hoy = new Date();
    
    // Prioridad 1: Si hay días confirmados, usar esos como base
    if (body.fechaConfirmacion && body.diasGestacionConfirmados) {
      const fechaConfirmacion = new Date(body.fechaConfirmacion);
      // Calcular fecha de servicio estimada restando los días confirmados
      fechaServicioCalculada = new Date(fechaConfirmacion.getTime() - (body.diasGestacionConfirmados * 24 * 60 * 60 * 1000));
      fechaProbableParto = new Date(fechaServicioCalculada.getTime() + (283 * 24 * 60 * 60 * 1000));
      
      // Calcular días actuales: días confirmados + días transcurridos desde la confirmación
      const diasDesdeConfirmacion = Math.floor((hoy.getTime() - fechaConfirmacion.getTime()) / (1000 * 60 * 60 * 24));
      diasGestacionActual = body.diasGestacionConfirmados + diasDesdeConfirmacion;
      diasGestacionActual = Math.max(0, diasGestacionActual);
    } 
    // Prioridad 2: Si hay fecha de servicio pero no confirmación, usar fecha de servicio
    else if (body.fechaServicio) {
      fechaServicioCalculada = new Date(body.fechaServicio);
      fechaProbableParto = new Date(fechaServicioCalculada.getTime() + (283 * 24 * 60 * 60 * 1000));
      
      // Calcular días actuales desde la fecha de servicio
      diasGestacionActual = Math.floor((hoy.getTime() - fechaServicioCalculada.getTime()) / (1000 * 60 * 60 * 24));
      diasGestacionActual = Math.max(0, diasGestacionActual);
    } 
    // Si no hay ninguno de los dos
    else {
      fechaServicioCalculada = new Date();
      fechaProbableParto = new Date(Date.now() + (283 * 24 * 60 * 60 * 1000));
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

    // Crear nueva gestación
    const nuevaGestacion = new Gestacion({
      ...body,
      userId: user.userId, // Asociar al usuario autenticado
      fechaServicio: fechaServicioCalculada, // Usar la fecha calculada
      fechaProbableParto,
      diasGestacionActual,
      trimestreActual,
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
