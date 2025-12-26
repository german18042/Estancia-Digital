import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ubicacion from '@/models/Ubicacion';
import { requireAuth } from '@/utils/authMiddleware';

// GET - Obtener ubicación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const ubicacion = await Ubicacion.findOne({
      _id: id,
      userId: user.userId
    });

    if (!ubicacion) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(ubicacion);
  } catch (error) {
    console.error('Error al obtener ubicación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ubicación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Verificar duplicados si se cambia el nombre
    if (body.nombre) {
      const ubicacionExistente = await Ubicacion.findOne({
        userId: user.userId,
        nombre: body.nombre,
        _id: { $ne: id },
        activa: true
      });

      if (ubicacionExistente) {
        return NextResponse.json(
          { error: 'Ya existe una ubicación con este nombre' },
          { status: 400 }
        );
      }
    }

    console.log('📥 Body recibido para actualización:', JSON.stringify(body, null, 2));
    console.log('🎨 Color recibido en body.color:', body.color);
    
    // Preparar datos de actualización - NO usar spread para evitar sobrescribir campos no enviados
    const datosActualizacion: any = {
      fechaActualizacion: new Date()
    };
    
    // Copiar solo los campos que vienen en el body
    if (body.nombre !== undefined) datosActualizacion.nombre = body.nombre;
    if (body.tipo !== undefined) datosActualizacion.tipo = body.tipo;
    if (body.capacidad !== undefined) datosActualizacion.capacidad = body.capacidad;
    if (body.area !== undefined) datosActualizacion.area = body.area;
    if (body.descripcion !== undefined) datosActualizacion.descripcion = body.descripcion;
    if (body.tipoPasto !== undefined) datosActualizacion.tipoPasto = body.tipoPasto;
    if (body.sistemaRiego !== undefined) datosActualizacion.sistemaRiego = body.sistemaRiego;
    if (body.estado !== undefined) datosActualizacion.estado = body.estado;
    if (body.activa !== undefined) datosActualizacion.activa = body.activa;
    if (body.geometria !== undefined) datosActualizacion.geometria = body.geometria;
    if (body.coordenadas !== undefined) datosActualizacion.coordenadas = body.coordenadas;
    if (body.caracteristicas !== undefined) datosActualizacion.caracteristicas = body.caracteristicas;
    
    // SIEMPRE actualizar el color si viene en el body, o usar el existente/por defecto
    if (body.color !== undefined && body.color !== null && body.color !== '') {
      datosActualizacion.color = body.color;
      console.log('🎨 Color del body será guardado:', body.color);
    } else {
      // Si no viene color, obtener el existente o usar por defecto     
      const ubicacionActual = await Ubicacion.findOne({ _id: id, userId: user.userId }).select('color').lean() as { color?: string } | null;                                         
      datosActualizacion.color = ubicacionActual?.color || '#ffff00';
      console.log('🎨 Color no en body, usando existente/por defecto:', datosActualizacion.color);
    }
    
    console.log('🎨 Color final a guardar en BD:', datosActualizacion.color);
    
    const ubicacionActualizada = await Ubicacion.findOneAndUpdate(
      { _id: id, userId: user.userId },
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!ubicacionActualizada) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(ubicacionActualizada);
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Marcar ubicación como inactiva
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { id } = await params;

    const ubicacion = await Ubicacion.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { activa: false, fechaActualizacion: new Date() },
      { new: true }
    );

    if (!ubicacion) {
      return NextResponse.json(
        { error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ubicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

