import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import Usuario from '../models/Usuario';

async function initUsers() {
  try {
    await connectDB();
    console.log('Conectado a MongoDB');

    // Verificar si ya existen usuarios
    const existingUsers = await Usuario.countDocuments();
    
    if (existingUsers > 0) {
      console.log(`Ya existen ${existingUsers} usuarios en la base de datos`);
      return;
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

    console.log('Usuarios por defecto creados exitosamente:');
    console.log('Administrador: admin@demo.com / password123');
    console.log('Usuario: usuario@demo.com / password123');
  } catch (error) {
    console.error('Error al inicializar usuarios:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initUsers().then(() => {
    console.log('Inicialización completada');
    process.exit(0);
  });
}

export default initUsers;

