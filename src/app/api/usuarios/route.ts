import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';

// Middleware para verificar autenticación y rol de administrador
async function verificarAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'No autorizado', status: 401 };
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.rol !== 'administrador') {
      return { error: 'Acceso denegado. Se requiere rol de administrador.', status: 403 };
    }

    return { usuario: decoded };
  } catch {
    return { error: 'Token inválido', status: 401 };
  }
}

// GET - Obtener todos los usuarios (solo administradores)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verificar permisos de administrador
    const authResult = await verificarAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const usuarios = await Usuario.find({})
      .select('-password')
      .sort({ fechaCreacion: -1 });

    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario (solo administradores)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verificar permisos de administrador
    const authResult = await verificarAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { nombre, email, password, rol } = await request.json();

    // Validar campos requeridos
    if (!nombre || !email || !password || !rol) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar rol
    if (!['administrador', 'usuario'].includes(rol)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email: email.toLowerCase(),
      password: hashedPassword,
      rol,
      activo: true
    });

    const usuarioGuardado = await nuevoUsuario.save();

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      usuario: {
        id: usuarioGuardado._id,
        nombre: usuarioGuardado.nombre,
        email: usuarioGuardado.email,
        rol: usuarioGuardado.rol,
        activo: usuarioGuardado.activo,
        fechaCreacion: usuarioGuardado.fechaCreacion
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
