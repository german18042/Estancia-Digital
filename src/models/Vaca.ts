import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el historial de partos
export interface IHistorialParto {
  fecha: Date;
  pesoCria?: number;
  sexoCria?: 'macho' | 'hembra';
  observaciones?: string;
}

// Interfaz para el historial médico
export interface IHistorialMedico {
  fecha: Date;
  tipo: 'vacuna' | 'tratamiento' | 'enfermedad' | 'revision';
  descripcion: string;
  veterinario?: string;
  medicamentos?: string[];
  observaciones?: string;
}

// Interfaz para el historial de movimientos
export interface IHistorialMovimiento {
  fecha: Date;
  ubicacionAnterior?: string;
  ubicacionNueva: string;
  motivo: string;
  observaciones?: string;
}

// Interfaz principal de la Vaca
export interface IVaca extends Document {
  // Propietario
  userId: string; // ID del usuario propietario
  
  // Identificación General
  numeroIdentificacion: string;
  nombre?: string;
  fechaNacimiento: Date;
  sexo: 'macho' | 'hembra';

  // Características Físicas
  raza: string;
  colorPelaje: string;
  peso: number; // en kg
  alturaCruz: number; // en cm
  caracteristicasDistintivas?: string;

  // Información Reproductiva
  estadoReproductivo: 'vacia' | 'gestante' | 'lactante' | 'secado' | 'no_apta';
  historialPartos: IHistorialParto[];
  ultimaFechaServicio?: Date;
  padre?: string;
  madre?: string;

  // Producción
  produccionLecheraDiaria?: number; // en litros
  gananciaPeso?: number; // en kg/mes

  // Salud y Bienestar
  historialMedico: IHistorialMedico[];
  condicionCorporal: 1 | 2 | 3 | 4 | 5; // escala 1-5
  observacionesComportamiento?: string;

  // Ubicación y Manejo
  ubicacionActual: string;
  historialMovimientos: IHistorialMovimiento[];
  alimentacion?: string;

  // Información Genética
  registroGenealogico?: string;

  // Datos Económicos
  costoAdquisicion?: number;
  valorEstimado?: number;
  costosAsociados?: number;

  // Metadatos
  fechaRegistro: Date;
  fechaActualizacion: Date;
  activa: boolean;
}

// Esquema de MongoDB
const VacaSchema = new Schema<IVaca>({
  // Propietario
  userId: {
    type: String,
    required: true,
    index: true
  },
  
  // Identificación General
  numeroIdentificacion: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  nombre: {
    type: String,
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: true
  },
  sexo: {
    type: String,
    required: true,
    enum: ['macho', 'hembra']
  },

  // Características Físicas
  raza: {
    type: String,
    required: true,
    trim: true
  },
  colorPelaje: {
    type: String,
    required: true,
    trim: true
  },
  peso: {
    type: Number,
    required: true,
    min: 0
  },
  alturaCruz: {
    type: Number,
    required: true,
    min: 0
  },
  caracteristicasDistintivas: {
    type: String,
    trim: true
  },

  // Información Reproductiva
  estadoReproductivo: {
    type: String,
    required: true,
    enum: ['vacia', 'gestante', 'lactante', 'secado', 'no_apta'],
    default: 'vacia'
  },
  historialPartos: [{
    fecha: {
      type: Date,
      required: true
    },
    pesoCria: Number,
    sexoCria: {
      type: String,
      enum: ['macho', 'hembra']
    },
    observaciones: String
  }],
  ultimaFechaServicio: Date,
  padre: String,
  madre: String,

  // Producción
  produccionLecheraDiaria: {
    type: Number,
    min: 0
  },
  gananciaPeso: Number,

  // Salud y Bienestar
  historialMedico: [{
    fecha: {
      type: Date,
      required: true
    },
    tipo: {
      type: String,
      required: true,
      enum: ['vacuna', 'tratamiento', 'enfermedad', 'revision']
    },
    descripcion: {
      type: String,
      required: true
    },
    veterinario: String,
    medicamentos: [String],
    observaciones: String
  }],
  condicionCorporal: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  observacionesComportamiento: String,

  // Ubicación y Manejo
  ubicacionActual: {
    type: String,
    required: true,
    trim: true
  },
  historialMovimientos: [{
    fecha: {
      type: Date,
      required: true
    },
    ubicacionAnterior: String,
    ubicacionNueva: {
      type: String,
      required: true
    },
    motivo: {
      type: String,
      required: true
    },
    observaciones: String
  }],
  alimentacion: String,

  // Información Genética
  registroGenealogico: String,

  // Datos Económicos
  costoAdquisicion: {
    type: Number,
    min: 0
  },
  valorEstimado: {
    type: Number,
    min: 0
  },
  costosAsociados: {
    type: Number,
    min: 0
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
VacaSchema.index({ userId: 1, numeroIdentificacion: 1 }, { unique: true }); // Único por usuario
VacaSchema.index({ userId: 1 }); // Para filtrar por usuario
VacaSchema.index({ fechaNacimiento: 1 });
VacaSchema.index({ raza: 1 });
VacaSchema.index({ estadoReproductivo: 1 });
VacaSchema.index({ ubicacionActual: 1 });
VacaSchema.index({ activa: 1 });

// Middleware para actualizar fechaActualizacion
VacaSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

// Método para calcular la edad
VacaSchema.methods.calcularEdad = function(): number {
  const hoy = new Date();
  const nacimiento = this.fechaNacimiento;
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();
  
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

// Método para obtener el último parto
VacaSchema.methods.ultimoParto = function(): IHistorialParto | null {
  if (this.historialPartos.length === 0) return null;
  return this.historialPartos[this.historialPartos.length - 1];
};

export default mongoose.models.Vaca || mongoose.model<IVaca>('Vaca', VacaSchema);
