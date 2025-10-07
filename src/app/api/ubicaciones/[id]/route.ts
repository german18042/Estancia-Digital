import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ubicacion from '@/models/Ubicacion';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener ubicación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const ubicacion = await Ubicacion.findOne({
      _id: id,
      userId: user.userId
    });

    if (!ubicacion) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(ubicacion);
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ubicación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Verificar duplicados si se cambia el nombre
    if (body.nombre) {
      const ubicacionExistente = await Ubicacion.findOne({
        userId: user.userId,
        nombre: body.nombre,
        _id: { $ne: id },
        activa: true
      });

      if (ubicacionExistente) {
        return NextResponse.json(
          { error: 'Ya existe una ubicación con este nombre' },
          { status: 400 }
        );
      }
    }

    const ubicacionActualizada = await Ubicacion.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { ...body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    );

    if (!ubicacionActualizada) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(ubicacionActualizada);
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Marcar ubicación como inactiva
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const ubicacion = await Ubicacion.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { activa: false, fechaActualizacion: new Date() },
      { new: true }
    );

    if (!ubicacion) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ubicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

