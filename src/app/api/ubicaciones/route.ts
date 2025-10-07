import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ubicacion from '@/models/Ubicacion';
import { requireAuth } from '@/utils/authMiddleware';

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

    const nuevaUbicacion = new Ubicacion({
      ...body,
      userId: user.userId
    });

    const ubicacionGuardada = await nuevaUbicacion.save();

    return NextResponse.json(ubicacionGuardada, { status: 201 });
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

