import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Usuario from '@/models/Usuario';

// POST - Inicializar usuarios por defecto
export async function POST() {
  try {
    await connectDB();

    // Verificar si ya existen usuarios
    const existingUsers = await Usuario.countDocuments();
    
    if (existingUsers > 0) {
      return NextResponse.json({
        message: `Ya existen ${existingUsers} usuarios en la base de datos`,
        usuariosExistentes: existingUsers
      });
    }

    // Crear usuarios por defecto
    const saltRounds = 12;
    
    // Usuario administrador
    const adminPassword = await bcrypt.hash('password123', saltRounds);
    const admin = new Usuario({
      nombre: 'Administrador',
      email: 'admin@demo.com',
      password: adminPassword,
      rol: 'administrador',
      activo: true
    });

    // Usuario normal
    const userPassword = await bcrypt.hash('password123', saltRounds);
    const user = new Usuario({
      nombre: 'Usuario Demo',
      email: 'usuario@demo.com',
      password: userPassword,
      rol: 'usuario',
      activo: true
    });

    await admin.save();
    await user.save();

    return NextResponse.json({
      message: 'Usuarios por defecto creados exitosamente',
      usuarios: [
        {
          nombre: 'Administrador',
          email: 'admin@demo.com',
          rol: 'administrador',
          password: 'password123'
        },
        {
          nombre: 'Usuario Demo',
          email: 'usuario@demo.com',
          rol: 'usuario',
          password: 'password123'
        }
      ]
    }, { status: 201 });
  } catch (error) {
    console.error('Error al inicializar usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

