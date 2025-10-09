import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gestacion from '@/models/Gestacion';
import { requireAuth } from '@/utils/authMiddleware';

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

    // Recalcular fechas y trimestre siempre
    let datosActualizacion = { ...body, fechaActualizacion: new Date() };
    
    // Usar los datos del body si están presentes, sino usar los existentes
    const fechaConfirmacion = body.fechaConfirmacion || gestacionActual.fechaConfirmacion;
    const diasGestacionConfirmados = body.diasGestacionConfirmados || gestacionActual.diasGestacionConfirmados;
    const fechaServicio = body.fechaServicio || gestacionActual.fechaServicio;

    let fechaServicioCalculada: Date | undefined;
    let fechaProbableParto: Date | undefined;
    let diasGestacionActual: number = 0;
    let trimestreActual: number = 1;
    const hoy = new Date();
    
    // Prioridad 1: Si hay días confirmados, usar esos como base
    if (fechaConfirmacion && diasGestacionConfirmados) {
      const fechaConf = new Date(fechaConfirmacion);
      // Calcular fecha de servicio estimada restando los días confirmados
      fechaServicioCalculada = new Date(fechaConf.getTime() - (diasGestacionConfirmados * 24 * 60 * 60 * 1000));
      fechaProbableParto = new Date(fechaServicioCalculada.getTime() + (283 * 24 * 60 * 60 * 1000));
      
      // Calcular días actuales: días confirmados + días transcurridos desde la confirmación
      const diasDesdeConfirmacion = Math.floor((hoy.getTime() - fechaConf.getTime()) / (1000 * 60 * 60 * 24));
      diasGestacionActual = diasGestacionConfirmados + diasDesdeConfirmacion;
      diasGestacionActual = Math.max(0, diasGestacionActual);
    } 
    // Prioridad 2: Si hay fecha de servicio pero no confirmación
    else if (fechaServicio) {
      fechaServicioCalculada = new Date(fechaServicio);
      fechaProbableParto = new Date(fechaServicioCalculada.getTime() + (283 * 24 * 60 * 60 * 1000));
      
      // Calcular días actuales desde la fecha de servicio
      diasGestacionActual = Math.floor((hoy.getTime() - fechaServicioCalculada.getTime()) / (1000 * 60 * 60 * 24));
      diasGestacionActual = Math.max(0, diasGestacionActual);
    }
    
    // Calcular trimestre actual
    if (diasGestacionActual <= 94) {
      trimestreActual = 1; // Primer trimestre: 0-94 días
    } else if (diasGestacionActual <= 189) {
      trimestreActual = 2; // Segundo trimestre: 95-189 días
    } else {
      trimestreActual = 3; // Tercer trimestre: 190+ días
    }
    
    datosActualizacion = {
      ...datosActualizacion,
      fechaServicio: fechaServicioCalculada,
      fechaProbableParto,
      diasGestacionActual,
      trimestreActual
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
