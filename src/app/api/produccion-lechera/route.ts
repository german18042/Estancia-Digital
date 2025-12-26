import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProduccionLechera from '@/models/ProduccionLechera';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener registros de producción lechera
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const vacaId = searchParams.get('vacaId');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    // Construir filtros
    const filtros: Record<string, unknown> = {
      userId: user.userId
    };
    
    if (vacaId) filtros.vacaId = vacaId;
    
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
      ProduccionLechera.find(filtros)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProduccionLechera.countDocuments(filtros)
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
    console.error('Error al obtener producción lechera:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro de producción
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const body = await request.json();

    // Validar campos requeridos
    const camposRequeridos = ['vacaId', 'numeroIdentificacionVaca', 'fecha'];
    for (const campo of camposRequeridos) {
      if (!body[campo]) {
        return NextResponse.json(
          { error: `El campo ${campo} es requerido` },
          { status: 400 }
        );
      }
    }

    // Calcular total
    const manana = body.ordenoManana || 0;
    const tarde = body.ordenoTarde || 0;
    const noche = body.ordenoNoche || 0;
    const totalDia = manana + tarde + noche;

    if (totalDia === 0) {
      return NextResponse.json(
        { error: 'Debe registrar al menos un ordeño' },
        { status: 400 }
      );
    }

    // Crear nuevo registro
    const nuevaProduccion = new ProduccionLechera({
      ...body,
      userId: user.userId,
      totalDia,
      fechaRegistro: new Date(),
      fechaActualizacion: new Date()
    });

    const produccionGuardada = await nuevaProduccion.save();

    return NextResponse.json(produccionGuardada, { status: 201 });
  } catch (error) {
    console.error('Error al crear producción:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

