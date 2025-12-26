import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProduccionFinca from '@/models/ProduccionFinca';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener registros de producción de finca
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    const filtros: Record<string, unknown> = {
      userId: user.userId
    };
    
    if (fechaInicio || fechaFin) {
      filtros.fecha = {};
      if (fechaInicio) (filtros.fecha as Record<string, unknown>).$gte = new Date(fechaInicio);
      if (fechaFin) {
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);
        (filtros.fecha as Record<string, unknown>).$lte = fechaFinDate;
      }
    }

    const skip = (page - 1) * limit;

    const [producciones, total] = await Promise.all([
      ProduccionFinca.find(filtros)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProduccionFinca.countDocuments(filtros)
    ]);

    return NextResponse.json({
      producciones,
      paginacion: {
        pagina: page,
        limite: limit,
        total,
        paginas: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener producción de finca:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro de producción de finca
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const body = await request.json();

    // Validar campos requeridos
    if (!body.fecha || body.totalLitros === undefined) {
      return NextResponse.json(
        { error: 'Fecha y total de litros son requeridos' },
        { status: 400 }
      );
    }

    if (body.totalLitros <= 0) {
      return NextResponse.json(
        { error: 'El total de litros debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un registro para esta fecha
    const fechaNormalizada = new Date(body.fecha);
    fechaNormalizada.setHours(0, 0, 0, 0);

    const registroExistente = await ProduccionFinca.findOne({
      userId: user.userId,
      fecha: {
        $gte: fechaNormalizada,
        $lt: new Date(fechaNormalizada.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (registroExistente) {
      return NextResponse.json(
        { error: 'Ya existe un registro para esta fecha. Use PUT para actualizar.' },
        { status: 400 }
      );
    }

    // Crear nuevo registro
    const nuevaProduccion = new ProduccionFinca({
      ...body,
      userId: user.userId,
      fecha: fechaNormalizada,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    });

    const produccionGuardada = await nuevaProduccion.save();

    return NextResponse.json(produccionGuardada, { status: 201 });
  } catch (error) {
    console.error('Error al crear producción de finca:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

