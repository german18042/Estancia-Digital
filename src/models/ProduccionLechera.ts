import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para un registro de producción
export interface IProduccionLechera extends Document {
  // Propietario
  userId: string;
  
  // Vaca
  vacaId: mongoose.Types.ObjectId;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  
  // Fecha del registro
  fecha: Date;
  
  // Producción por ordeño
  ordenoManana?: number; // Litros
  ordenoTarde?: number; // Litros
  ordenoNoche?: number; // Litros
  totalDia: number; // Total del día
  
  // Calidad de leche (opcional)
  grasa?: number; // Porcentaje
  proteina?: number; // Porcentaje
  celulasSomaticas?: number; // Células/ml
  
  // Estado
  observaciones?: string;
  anomalias?: string; // Mastitis, sangre, etc.
  
  // Metadatos
  fechaRegistro: Date;
  fechaActualizacion: Date;
}

const ProduccionLecheraSchema = new Schema<IProduccionLechera>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  vacaId: {
    type: Schema.Types.ObjectId,
    ref: 'Vaca',
    required: true,
    index: true
  },
  
  numeroIdentificacionVaca: {
    type: String,
    required: true,
    index: true
  },
  
  nombreVaca: String,
  
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  
  ordenoManana: {
    type: Number,
    min: 0,
    default: 0
  },
  
  ordenoTarde: {
    type: Number,
    min: 0,
    default: 0
  },
  
  ordenoNoche: {
    type: Number,
    min: 0,
    default: 0
  },
  
  totalDia: {
    type: Number,
    required: true,
    min: 0
  },
  
  grasa: {
    type: Number,
    min: 0,
    max: 100
  },
  
  proteina: {
    type: Number,
    min: 0,
    max: 100
  },
  
  celulasSomaticas: {
    type: Number,
    min: 0
  },
  
  observaciones: String,
  anomalias: String,
  
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

// Índices compuestos para optimizar consultas
ProduccionLecheraSchema.index({ userId: 1, fecha: -1 });
ProduccionLecheraSchema.index({ userId: 1, vacaId: 1, fecha: -1 });
ProduccionLecheraSchema.index({ userId: 1, numeroIdentificacionVaca: 1 });

// Middleware para calcular total automáticamente
ProduccionLecheraSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  
  // Calcular total del día
  const manana = this.ordenoManana || 0;
  const tarde = this.ordenoTarde || 0;
  const noche = this.ordenoNoche || 0;
  this.totalDia = manana + tarde + noche;
  
  next();
});

export default mongoose.models.ProduccionLechera || 
  mongoose.model<IProduccionLechera>('ProduccionLechera', ProduccionLecheraSchema);

