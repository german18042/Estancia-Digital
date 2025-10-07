import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vaca from '@/models/Vaca';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener vacas del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const activa = searchParams.get('activa');
    const raza = searchParams.get('raza');
    const estadoReproductivo = searchParams.get('estadoReproductivo');

    // Construir filtros - siempre incluir userId del usuario
    const filtros: Record<string, unknown> = {
      userId: user.userId, // Solo vacas del usuario autenticado
      activa: true // Por defecto, solo mostrar vacas activas
    };
    if (activa !== null) filtros.activa = activa === 'true'; // Permitir override del filtro
    if (raza) filtros.raza = new RegExp(raza, 'i');
    if (estadoReproductivo) filtros.estadoReproductivo = estadoReproductivo;

    const skip = (page - 1) * limit;

    const [vacas, total] = await Promise.all([
      Vaca.find(filtros)
        .sort({ fechaRegistro: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vaca.countDocuments(filtros)
    ]);

    return NextResponse.json({
      vacas,
      paginacion: {
        pagina: page,
        limite: limit,
        total,
        paginas: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener vacas:', error);
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

// POST - Crear nueva vaca
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Obtener usuario autenticado
    const user = await requireAuth(request);

    const body = await request.json();

    // Validar campos requeridos
    const camposRequeridos = [
      'numeroIdentificacion',
      'fechaNacimiento',
      'sexo',
      'raza',
      'colorPelaje',
      'peso',
      'alturaCruz',
      'ubicacionActual'
    ];

    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `El campo ${campo} es requerido` },
          { status: 400 }
        );
      }
    }

    // Verificar si ya existe una vaca con el mismo número de identificación para este usuario
    const vacaExistente = await Vaca.findOne({
      userId: user.userId,
      numeroIdentificacion: body.numeroIdentificacion
    });

    if (vacaExistente) {
      return NextResponse.json(
        { error: 'Ya tienes una vaca con este número de identificación' },
        { status: 400 }
      );
    }

    // Crear nueva vaca
    const nuevaVaca = new Vaca({
      ...body,
      userId: user.userId, // Asociar al usuario autenticado
      fechaRegistro: new Date(),
      fechaActualizacion: new Date(),
      activa: true
    });

    const vacaGuardada = await nuevaVaca.save();

    return NextResponse.json(vacaGuardada, { status: 201 });
  } catch (error) {
    console.error('Error al crear vaca:', error);
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
