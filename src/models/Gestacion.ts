import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el seguimiento de gestación
export interface IHistorialGestacion {
  fecha: Date;
  observaciones: string;
  peso?: number;
  condicionCorporal?: number;
  examenes?: string[];
  veterinario?: string;
}

// Interfaz principal de Gestación
export interface IGestacion extends Document {
  // Propietario
  userId: string; // ID del usuario propietario
  
  vacaId: mongoose.Types.ObjectId;
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  
  // Información del servicio/monta
  fechaServicio?: Date;
  tipoServicio: 'monta_natural' | 'inseminacion_artificial' | 'transferencia_embrion';
  toroPadre?: string; // ID del toro o nombre
  semenToro?: string; // Información del semen usado
  
  // Confirmación de gestación
  fechaConfirmacion?: Date;
  diasGestacionConfirmados?: number; // Días de gestación confirmados por el veterinario
  metodoConfirmacion?: 'palpacion' | 'ecografia' | 'analisis_sangre' | 'observacion_comportamiento';
  confirmadoPor?: string; // Veterinario que confirmó
  
  // Cálculos automáticos
  fechaProbableParto: Date;
  diasGestacionActual?: number;
  trimestreActual?: 1 | 2 | 3;
  
  // Seguimiento durante la gestación
  historialGestacion: IHistorialGestacion[];
  pesoInicial?: number;
  pesoActual?: number;
  gananciaPeso?: number;
  
  // Cuidados especiales
  dietaEspecial?: string;
  medicamentos?: string[];
  restricciones?: string[];
  ejercicioRecomendado?: string;
  
  // Información del parto
  fechaRealParto?: Date;
  tipoParto?: 'normal' | 'cesarea' | 'asistido' | 'dificil';
  asistenciaVeterinaria?: boolean;
  pesoCria?: number;
  sexoCria?: 'macho' | 'hembra';
  estadoCria?: 'vivo' | 'muerto' | 'debil';
  observacionesParto?: string;
  
  // Estado actual
  estado: 'en_gestacion' | 'parto_exitoso' | 'aborto' | 'parto_dificil' | 'complicaciones';
  
  // Metadatos
  fechaRegistro: Date;
  fechaActualizacion: Date;
  activa: boolean;
}

// Esquema de MongoDB
const GestacionSchema = new Schema<IGestacion>({
  // Propietario
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  vacaId: {
    type: Schema.Types.ObjectId,
    ref: 'Vaca',
    required: true
  },
  numeroIdentificacionVaca: {
    type: String,
    required: true
  },
  nombreVaca: String,
  
  // Información del servicio
  fechaServicio: {
    type: Date,
    required: false
  },
  tipoServicio: {
    type: String,
    required: true,
    enum: ['monta_natural', 'inseminacion_artificial', 'transferencia_embrion']
  },
  toroPadre: String,
  semenToro: String,
  
  // Confirmación
  fechaConfirmacion: Date,
  diasGestacionConfirmados: {
    type: Number,
    min: 1,
    max: 300
  },
  metodoConfirmacion: {
    type: String,
    enum: ['palpacion', 'ecografia', 'analisis_sangre', 'observacion_comportamiento']
  },
  confirmadoPor: String,
  
  // Cálculos automáticos
  fechaProbableParto: {
    type: Date,
    required: true
  },
  diasGestacionActual: Number,
  trimestreActual: {
    type: Number,
    enum: [1, 2, 3]
  },
  
  // Seguimiento
  historialGestacion: [{
    fecha: {
      type: Date,
      required: true
    },
    observaciones: {
      type: String,
      required: true
    },
    peso: Number,
    condicionCorporal: Number,
    examenes: [String],
    veterinario: String
  }],
  pesoInicial: Number,
  pesoActual: Number,
  gananciaPeso: Number,
  
  // Cuidados especiales
  dietaEspecial: String,
  medicamentos: [String],
  restricciones: [String],
  ejercicioRecomendado: String,
  
  // Información del parto
  fechaRealParto: Date,
  tipoParto: {
    type: String,
    enum: ['normal', 'cesarea', 'asistido', 'dificil']
  },
  asistenciaVeterinaria: Boolean,
  pesoCria: Number,
  sexoCria: {
    type: String,
    enum: ['macho', 'hembra']
  },
  estadoCria: {
    type: String,
    enum: ['vivo', 'muerto', 'debil']
  },
  observacionesParto: String,
  
  // Estado actual
  estado: {
    type: String,
    required: true,
    enum: ['en_gestacion', 'parto_exitoso', 'aborto', 'parto_dificil', 'complicaciones'],
    default: 'en_gestacion'
  },
  
  // Metadatos
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
GestacionSchema.index({ vacaId: 1 });
GestacionSchema.index({ numeroIdentificacionVaca: 1 });
GestacionSchema.index({ fechaServicio: 1 });
GestacionSchema.index({ fechaProbableParto: 1 });
GestacionSchema.index({ estado: 1 });
GestacionSchema.index({ activa: 1 });

// Middleware para actualizar fechaActualizacion y cálculos automáticos
GestacionSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  
  // Calcular fecha probable de parto (283 días promedio para vacas)
  if (this.fechaServicio && !this.fechaProbableParto) {
    this.fechaProbableParto = new Date(this.fechaServicio.getTime() + (283 * 24 * 60 * 60 * 1000));
  }
  
  // Calcular días de gestación actual
  if (this.fechaServicio) {
    const hoy = new Date();
    const diasTranscurridos = Math.floor((hoy.getTime() - this.fechaServicio.getTime()) / (1000 * 60 * 60 * 24));
    this.diasGestacionActual = diasTranscurridos;
    
    // Calcular trimestre
    if (diasTranscurridos <= 94) {
      this.trimestreActual = 1;
    } else if (diasTranscurridos <= 189) {
      this.trimestreActual = 2;
    } else {
      this.trimestreActual = 3;
    }
  }
  
  // Calcular ganancia de peso
  if (this.pesoInicial && this.pesoActual) {
    this.gananciaPeso = this.pesoActual - this.pesoInicial;
  }
  
  next();
});

// Método para calcular días restantes hasta el parto
GestacionSchema.methods.diasRestantesParto = function(): number {
  const hoy = new Date();
  const diasRestantes = Math.ceil((this.fechaProbableParto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  return diasRestantes;
};

// Método para verificar si está cerca del parto
GestacionSchema.methods.estaCercaDelParto = function(): boolean {
  const diasRestantes = this.diasRestantesParto();
  return diasRestantes <= 30 && diasRestantes >= 0;
};

// Método para verificar si está en período crítico
GestacionSchema.methods.enPeriodoCritico = function(): boolean {
  const diasRestantes = this.diasRestantesParto();
  return diasRestantes <= 14 && diasRestantes >= 0;
};

// Índices para optimizar consultas
GestacionSchema.index({ userId: 1 }); // Para filtrar por usuario
GestacionSchema.index({ userId: 1, vacaId: 1 }); // Para consultas por usuario y vaca
GestacionSchema.index({ fechaServicio: 1 });
GestacionSchema.index({ estado: 1 });
GestacionSchema.index({ activa: 1 });

export default mongoose.models.Gestacion || mongoose.model<IGestacion>('Gestacion', GestacionSchema);
