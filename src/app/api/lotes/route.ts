import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lote from '@/models/Lote';
import Vaca from '@/models/Vaca';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener lotes con estadísticas
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const activo = searchParams.get('activo');
    const conEstadisticas = searchParams.get('estadisticas') === 'true';

    const filtros: Record<string, unknown> = {
      userId: user.userId
    };
    
    if (activo !== null) {
      filtros.activo = activo === 'true';
    }

    const lotes = await Lote.find(filtros).sort({ nombre: 1 }).lean();

    // Si se solicitan estadísticas, agregar conteo de vacas
    if (conEstadisticas) {
      const lotesConEstadisticas = await Promise.all(
        lotes.map(async (lote) => {
          const numeroVacas = await Vaca.countDocuments({
            userId: user.userId,
            lote: lote.nombre,
            activa: true
          });

          return {
            ...lote,
            numeroVacas
          };
        })
      );

      return NextResponse.json({ lotes: lotesConEstadisticas });
    }

    return NextResponse.json({ lotes });
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo lote
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.nombre) {
      return NextResponse.json(
        { error: 'El nombre del lote es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un lote con ese nombre
    const loteExistente = await Lote.findOne({
      userId: user.userId,
      nombre: body.nombre
    });

    if (loteExistente) {
      return NextResponse.json(
        { error: 'Ya existe un lote con ese nombre' },
        { status: 400 }
      );
    }

    const nuevoLote = new Lote({
      ...body,
      userId: user.userId,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });

    const loteGuardado = await nuevoLote.save();

    return NextResponse.json(loteGuardado, { status: 201 });
  } catch (error) {
    console.error('Error al crear lote:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

