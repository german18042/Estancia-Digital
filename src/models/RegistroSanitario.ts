import mongoose, { Document, Schema } from 'mongoose';

// Tipos de registros sanitarios
export type TipoRegistroSanitario = 
  | 'vacuna' 
  | 'desparasitacion' 
  | 'tratamiento' 
  | 'revision' 
  | 'cirugia' 
  | 'otro';

// Interfaz para un registro sanitario
export interface IRegistroSanitario extends Document {
  // Propietario
  userId: string;
  
  // Vaca
  vacaId: mongoose.Types.ObjectId;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  
  // Tipo de registro
  tipo: TipoRegistroSanitario;
  
  // Fecha del procedimiento
  fecha: Date;
  
  // Información del procedimiento
  nombre: string; // Nombre de vacuna, medicamento, etc.
  descripcion?: string;
  diagnostico?: string; // Para tratamientos
  
  // Medicamento/Vacuna
  producto?: string;
  dosis?: string;
  viaAdministracion?: 'oral' | 'inyectable' | 'topica' | 'otra';
  lote?: string;
  
  // Veterinario
  veterinario?: string;
  
  // Seguimiento
  proximaFecha?: Date; // Para refuerzos, revisiones
  diasRetiro?: number; // Para medicamentos en producción
  
  // Costo
  costo?: number;
  
  // Resultados y observaciones
  resultado?: string;
  observaciones?: string;
  efectosSecundarios?: string;
  
  // Archivos adjuntos (URLs)
  documentos?: string[]; // Recetas, certificados, etc.
  
  // Estado
  completado: boolean;
  recordatorioEnviado?: boolean;
  
  // Metadatos
  fechaRegistro: Date;
  fechaActualizacion: Date;
}

const RegistroSanitarioSchema = new Schema<IRegistroSanitario>({
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
  
  tipo: {
    type: String,
    required: true,
    enum: ['vacuna', 'desparasitacion', 'tratamiento', 'revision', 'cirugia', 'otro'],
    index: true
  },
  
  fecha: {
    type: Date,
    required: true,
    index: true
  },
  
  nombre: {
    type: String,
    required: true
  },
  
  descripcion: String,
  diagnostico: String,
  
  producto: String,
  dosis: String,
  viaAdministracion: {
    type: String,
    enum: ['oral', 'inyectable', 'topica', 'otra']
  },
  lote: String,
  
  veterinario: String,
  
  proximaFecha: {
    type: Date,
    index: true
  },
  
  diasRetiro: {
    type: Number,
    min: 0
  },
  
  costo: {
    type: Number,
    min: 0
  },
  
  resultado: String,
  observaciones: String,
  efectosSecundarios: String,
  
  documentos: [String],
  
  completado: {
    type: Boolean,
    default: true
  },
  
  recordatorioEnviado: {
    type: Boolean,
    default: false
  },
  
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
RegistroSanitarioSchema.index({ userId: 1, fecha: -1 });
RegistroSanitarioSchema.index({ userId: 1, vacaId: 1, fecha: -1 });
RegistroSanitarioSchema.index({ userId: 1, tipo: 1 });
RegistroSanitarioSchema.index({ userId: 1, proximaFecha: 1, completado: 1 });

// Middleware
RegistroSanitarioSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.models.RegistroSanitario || 
  mongoose.model<IRegistroSanitario>('RegistroSanitario', RegistroSanitarioSchema);

