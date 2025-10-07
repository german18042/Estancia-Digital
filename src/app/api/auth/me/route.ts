import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura';

// GET - Obtener información del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Obtener token de la cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Buscar usuario en la base de datos
    const usuario = await Usuario.findById(decoded.userId).select('-password');

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ultimoAcceso: usuario.ultimoAcceso,
        fechaCreacion: usuario.fechaCreacion
      }
    });
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }
}

