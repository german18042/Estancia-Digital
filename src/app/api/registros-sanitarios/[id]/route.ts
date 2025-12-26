import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistroSanitario from '@/models/RegistroSanitario';
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

    const registro = await RegistroSanitario.findOne({ 
      _id: id, 
      userId: user.userId 
    });

    if (!registro) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(registro);
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

    const registroActualizado = await RegistroSanitario.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { ...body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    );

    if (!registroActualizado) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(registroActualizado);
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

    const registroEliminado = await RegistroSanitario.findOneAndDelete({
      _id: id,
      userId: user.userId
    });

    if (!registroEliminado) {
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

