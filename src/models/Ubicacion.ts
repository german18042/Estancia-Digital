import mongoose, { Document, Schema } from 'mongoose';

export interface IUbicacion extends Document {
  userId: string; // ID del usuario propietario
  nombre: string;
  tipo: 'potrero' | 'corral' | 'establo' | 'area_especial' | 'otro';
  capacidad?: number; // Número máximo de animales
  area?: number; // Área en hectáreas o metros cuadrados
  descripcion?: string;
  caracteristicas?: string[]; // Ej: ['sombra', 'agua', 'comedero']
  estado: 'activa' | 'mantenimiento' | 'inactiva';
  activa: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
}

const UbicacionSchema = new Schema<IUbicacion>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ['potrero', 'corral', 'establo', 'area_especial', 'otro'],
    default: 'potrero'
  },
  capacidad: {
    type: Number,
    min: 0
  },
  area: {
    type: Number,
    min: 0
  },
  descripcion: {
    type: String,
    trim: true
  },
  caracteristicas: [String],
  estado: {
    type: String,
    enum: ['activa', 'mantenimiento', 'inactiva'],
    default: 'activa'
  },
  activa: {
    type: Boolean,
    default: true,
    index: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar consultas
UbicacionSchema.index({ userId: 1, nombre: 1 }, { unique: true });
UbicacionSchema.index({ userId: 1, activa: 1 });
UbicacionSchema.index({ userId: 1, estado: 1 });

// Middleware para actualizar fechaActualizacion
UbicacionSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

const Ubicacion = mongoose.models.Ubicacion || mongoose.model<IUbicacion>('Ubicacion', UbicacionSchema);

export default Ubicacion;

