import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lote from '@/models/Lote';
import Vaca from '@/models/Vaca';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener un lote específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await requireAuth(request);

    const lote = await Lote.findOne({ _id: id, userId: user.userId });

    if (!lote) {
      return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 });
    }

    // Obtener vacas del lote
    const vacas = await Vaca.find({
      userId: user.userId,
      lote: lote.nombre,
      activa: true
    }).select('numeroIdentificacion nombre estadoReproductivo');

    return NextResponse.json({ lote, vacas });
  } catch (error) {
    console.error('Error al obtener lote:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar lote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await requireAuth(request);
    const body = await request.json();

    const loteActual = await Lote.findOne({ _id: id, userId: user.userId });
    if (!loteActual) {
      return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 });
    }

    // Si cambia el nombre, actualizar en todas las vacas
    if (body.nombre && body.nombre !== loteActual.nombre) {
      await Vaca.updateMany(
        { userId: user.userId, lote: loteActual.nombre },
        { lote: body.nombre }
      );
    }

    const loteActualizado = await Lote.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { ...body, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    );

    return NextResponse.json(loteActualizado);
  } catch (error) {
    console.error('Error al actualizar lote:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar lote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await requireAuth(request);

    const lote = await Lote.findOne({ _id: id, userId: user.userId });
    if (!lote) {
      return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 });
    }

    // Verificar si hay vacas asignadas
    const vacasEnLote = await Vaca.countDocuments({
      userId: user.userId,
      lote: lote.nombre,
      activa: true
    });

    if (vacasEnLote > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${vacasEnLote} vaca(s) asignada(s) a este lote.` },
        { status: 400 }
      );
    }

    await Lote.findOneAndDelete({ _id: id, userId: user.userId });

    return NextResponse.json({ message: 'Lote eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar lote:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

