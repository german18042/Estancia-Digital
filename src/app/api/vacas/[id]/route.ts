import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vaca from '@/models/Vaca';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener vaca por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const vaca = await Vaca.findOne({ _id: id, userId: user.userId });

    if (!vaca) {
      return NextResponse.json(
        { error: 'Vaca no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(vaca);
  } catch (error) {
    console.error('Error al obtener vaca:', error);
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

// PUT - Actualizar vaca
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

    // Si se está actualizando el número de identificación, verificar que no exista para este usuario
    if (body.numeroIdentificacion) {
      const vacaExistente = await Vaca.findOne({
        userId: user.userId,
        numeroIdentificacion: body.numeroIdentificacion,
        _id: { $ne: id }
      });

      if (vacaExistente) {
        return NextResponse.json(
          { error: 'Ya tienes una vaca con este número de identificación' },
          { status: 400 }
        );
      }
    }

    const vacaActualizada = await Vaca.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { ...body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    );

    if (!vacaActualizada) {
      return NextResponse.json(
        { error: 'Vaca no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(vacaActualizada);
  } catch (error) {
    console.error('Error al actualizar vaca:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar vaca (marcar como inactiva)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const vaca = await Vaca.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { activa: false, fechaActualizacion: new Date() },
      { new: true }
    );

    if (!vaca) {
      return NextResponse.json(
        { error: 'Vaca no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vaca marcada como inactiva' });
  } catch (error) {
    console.error('Error al eliminar vaca:', error);
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
