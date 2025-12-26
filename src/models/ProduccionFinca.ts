import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para producción total de la finca
export interface IProduccionFinca extends Document {
  // Propietario
  userId: string;
  
  // Fecha del registro
  fecha: Date;
  
  // Producción total
  totalLitros: number;
  numeroVacasOrdenadas?: number; // Cuántas vacas se ordeñaron
  
  // Calidad promedio (opcional)
  grasaPromedio?: number;
  proteinaPromedio?: number;
  
  // Costos del día (opcional)
  costoAlimentacion?: number;
  costoManoObra?: number;
  otrosCostos?: number;
  
  // Observaciones
  observaciones?: string;
  clima?: string; // Soleado, lluvioso, etc.
  
  // Metadatos
  fechaRegistro: Date;
  fechaActualizacion: Date;
}

const ProduccionFincaSchema = new Schema<IProduccionFinca>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  
  totalLitros: {
    type: Number,
    required: true,
    min: 0
  },
  
  numeroVacasOrdenadas: {
    type: Number,
    min: 0
  },
  
  grasaPromedio: {
    type: Number,
    min: 0,
    max: 100
  },
  
  proteinaPromedio: {
    type: Number,
    min: 0,
    max: 100
  },
  
  costoAlimentacion: {
    type: Number,
    min: 0
  },
  
  costoManoObra: {
    type: Number,
    min: 0
  },
  
  otrosCostos: {
    type: Number,
    min: 0
  },
  
  observaciones: String,
  clima: String,
  
  fechaRegistro: {
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

// Índices compuestos
ProduccionFincaSchema.index({ userId: 1, fecha: -1 });

// Prevenir duplicados (un solo registro por día por usuario)
ProduccionFincaSchema.index({ userId: 1, fecha: 1 }, { unique: true });

// Middleware
ProduccionFincaSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.ProduccionFinca || 
  mongoose.model<IProduccionFinca>('ProduccionFinca', ProduccionFincaSchema);

