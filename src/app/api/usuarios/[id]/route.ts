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

// PUT - Actualizar usuario (solo administradores)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verificar permisos de administrador
    const authResult = await verificarAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { nombre, email, rol, activo, password } = body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Validar rol si se proporciona
    if (rol && !['administrador', 'usuario'].includes(rol)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe (si se está cambiando)
    if (email && email !== usuario.email) {
      const usuarioExistente = await Usuario.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (usuarioExistente) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const datosActualizacion: any = {
      nombre: nombre || usuario.nombre,
      email: email ? email.toLowerCase() : usuario.email,
      rol: rol || usuario.rol,
      activo: activo !== undefined ? activo : usuario.activo
    };

    // Encriptar nueva contraseña si se proporciona
    if (password) {
      const saltRounds = 12;
      datosActualizacion.password = await bcrypt.hash(password, saltRounds);
    }

    // Actualizar usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true }
    ).select('-password');

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      usuario: {
        id: usuarioActualizado._id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol,
        activo: usuarioActualizado.activo,
        fechaActualizacion: usuarioActualizado.fechaActualizacion
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario (solo administradores)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verificar permisos de administrador
    const authResult = await verificarAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Verificar si el usuario existe
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar el propio usuario
    if (authResult.usuario.userId === id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Eliminar usuario
    await Usuario.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
