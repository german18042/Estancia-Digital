import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProduccionFinca from '@/models/ProduccionFinca';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener un registro específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await requireAuth(request);

    const produccion = await ProduccionFinca.findOne({ 
      _id: id, 
      userId: user.userId 
    });

    if (!produccion) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(produccion);
  } catch (error) {
    console.error('Error al obtener registro:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar registro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await requireAuth(request);
    const body = await request.json();

    const produccionActualizada = await ProduccionFinca.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { ...body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    );

    if (!produccionActualizada) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(produccionActualizada);
  } catch (error) {
    console.error('Error al actualizar registro:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar registro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await requireAuth(request);

    const produccionEliminada = await ProduccionFinca.findOneAndDelete({
      _id: id,
      userId: user.userId
    });

    if (!produccionEliminada) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

