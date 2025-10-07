import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura';

// POST - Login de usuario
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return NextResponse.json(
        { error: 'Usuario inactivo. Contacta al administrador.' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Actualizar último acceso
    await usuario.actualizarUltimoAcceso();

    // Crear token JWT
    const token = jwt.sign(
      { 
        userId: usuario._id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Crear respuesta
    const response = NextResponse.json({
      message: 'Login exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        ultimoAcceso: usuario.ultimoAcceso
      },
      token
    });

    // Configurar cookie segura
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 horas
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

