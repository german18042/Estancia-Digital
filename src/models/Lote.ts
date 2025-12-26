import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para un lote o grupo de vacas
export interface ILote extends Document {
  // Propietario
  userId: string;
  
  // Identificación del lote
  nombre: string;
  descripcion?: string;
  color?: string; // Para identificación visual
  
  // Configuración
  tipoLote?: 'produccion' | 'gestacion' | 'novillas' | 'secas' | 'enfermeria' | 'venta' | 'otro';
  capacidadMaxima?: number;
  
  // Ubicación asociada
  ubicacionPrincipal?: string;
  
  // Manejo especial
  dietaEspecial?: string;
  protocoloManejo?: string;
  
  // Metadatos
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

const LoteSchema = new Schema<ILote>({
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
  
  descripcion: {
    type: String,
    trim: true
  },
  
  color: {
    type: String,
    default: '#3B82F6' // Azul por defecto
  },
  
  tipoLote: {
    type: String,
    enum: ['produccion', 'gestacion', 'novillas', 'secas', 'enfermeria', 'venta', 'otro'],
    default: 'otro'
  },
  
  capacidadMaxima: {
    type: Number,
    min: 1
  },
  
  ubicacionPrincipal: String,
  dietaEspecial: String,
  protocoloManejo: String,
  
  activo: {
    type: Boolean,
    default: true
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

// Índices
LoteSchema.index({ userId: 1, nombre: 1 }, { unique: true }); // Nombre único por usuario
LoteSchema.index({ userId: 1, activo: 1 });

// Middleware
LoteSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.Lote || mongoose.model<ILote>('Lote', LoteSchema);

