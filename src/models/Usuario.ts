import mongoose, { Document, Schema } from 'mongoose';

// Interfaz del Usuario
export interface IUsuario extends Document {
  nombre: string;
  email: string;
  password: string;
  rol: 'administrador' | 'usuario';
  activo: boolean;
  ultimoAcceso?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Esquema de MongoDB
const UsuarioSchema = new Schema<IUsuario>({
  nombre: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: String,
    required: true,
    enum: ['administrador', 'usuario'],
    default: 'usuario'
  },
  activo: {
    type: Boolean,
    default: true
  },
  ultimoAcceso: {
    type: Date
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ rol: 1 });
UsuarioSchema.index({ activo: 1 });

// Middleware para actualizar fechaActualizacion
UsuarioSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

// Método para actualizar último acceso
UsuarioSchema.methods.actualizarUltimoAcceso = function() {
  this.ultimoAcceso = new Date();
  return this.save();
};

// Método para verificar si es administrador
UsuarioSchema.methods.esAdministrador = function() {
  return this.rol === 'administrador';
};

// Método para verificar si es usuario activo
UsuarioSchema.methods.esActivo = function() {
  return this.activo;
};

export default mongoose.models.Usuario || mongoose.model<IUsuario>('Usuario', UsuarioSchema);

