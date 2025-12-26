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

// GET - Obtener gestación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const gestacion = await Gestacion.findOne({ 
      _id: id, 
      userId: user.userId 
    });

    if (!gestacion) {
      return NextResponse.json(
        { error: 'Gestación no encontrada o no tienes permisos para verla' },
        { status: 404 }
      );
    }

    return NextResponse.json(gestacion);
  } catch (error) {
    console.error('Error al obtener gestación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar gestación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const body = await request.json();

    // Obtener la gestación actual para tener los datos existentes
    const gestacionActual = await Gestacion.findOne({ _id: id, userId: user.userId });
    if (!gestacionActual) {
      return NextResponse.json(
        { error: 'Gestación no encontrada o no tienes permisos para actualizarla' },
        { status: 404 }
      );
    }

    // Combinar datos del body con los existentes (body tiene prioridad)
    const fechaConfirmacion = body.fechaConfirmacion !== undefined 
      ? body.fechaConfirmacion 
      : gestacionActual.fechaConfirmacion;
    const diasGestacionConfirmados = body.diasGestacionConfirmados !== undefined
      ? body.diasGestacionConfirmados
      : gestacionActual.diasGestacionConfirmados;
    const fechaServicio = body.fechaServicio !== undefined
      ? body.fechaServicio
      : gestacionActual.fechaServicio;

    // Calcular todos los datos de gestación usando la función centralizada
    const datosCalculados = calcularDatosGestacion({
      fechaConfirmacion,
      diasGestacionConfirmados,
      fechaServicio
    });
    
    // Preparar datos de actualización con valores calculados
    const datosActualizacion = {
      ...body,
      fechaServicio: datosCalculados.fechaServicio,
      fechaProbableParto: datosCalculados.fechaProbableParto,
      diasGestacionActual: datosCalculados.diasGestacionActual,
      trimestreActual: datosCalculados.trimestreActual,
      fechaActualizacion: new Date()
    };

    const gestacionActualizada = await Gestacion.findOneAndUpdate(
      { _id: id, userId: user.userId }, // Verificar que pertenezca al usuario
      datosActualizacion,
      { new: true, runValidators: true }
    );

    return NextResponse.json(gestacionActualizada);
  } catch (error) {
    console.error('Error al actualizar gestación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar gestación (marcar como inactiva)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const gestacion = await Gestacion.findOneAndUpdate(
      { _id: id, userId: user.userId }, // Verificar que pertenezca al usuario
      { activa: false, fechaActualizacion: new Date() },
      { new: true }
    );

    if (!gestacion) {
      return NextResponse.json(
        { error: 'Gestación no encontrada o no tienes permisos para eliminarla' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Gestación marcada como inactiva' });
  } catch (error) {
    console.error('Error al eliminar gestación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
