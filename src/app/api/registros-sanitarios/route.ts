import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistroSanitario from '@/models/RegistroSanitario';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener registros sanitarios
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const vacaId = searchParams.get('vacaId');
    const tipo = searchParams.get('tipo');
    const pendientes = searchParams.get('pendientes') === 'true';

    // Construir filtros
    const filtros: Record<string, unknown> = {
      userId: user.userId
    };
    
    if (vacaId) filtros.vacaId = vacaId;
    if (tipo) filtros.tipo = tipo;
    
    // Filtrar registros pendientes (próximas fechas no completadas)
    if (pendientes) {
      filtros.completado = false;
      filtros.proximaFecha = { $exists: true, $ne: null };
    }

    const skip = (page - 1) * limit;

    const [registros, total] = await Promise.all([
      RegistroSanitario.find(filtros)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RegistroSanitario.countDocuments(filtros)
    ]);

    return NextResponse.json({
      registros,
      paginacion: {
        pagina: page,
        limite: limit,
        total,
        paginas: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener registros sanitarios:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro sanitario
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const body = await request.json();

    // Validar campos requeridos
    const camposRequeridos = ['vacaId', 'numeroIdentificacionVaca', 'tipo', 'fecha', 'nombre'];
    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `El campo ${campo} es requerido` },
          { status: 400 }
        );
      }
    }

    // Crear nuevo registro
    const nuevoRegistro = new RegistroSanitario({
      ...body,
      userId: user.userId,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    });

    const registroGuardado = await nuevoRegistro.save();

    return NextResponse.json(registroGuardado, { status: 201 });
  } catch (error) {
    console.error('Error al crear registro sanitario:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

