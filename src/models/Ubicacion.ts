import mongoose, { Document, Schema } from 'mongoose';

// Interfaz GeoJSON Polygon
export interface IGeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
}

// Interfaz para punto de coordenadas manual
export interface ICoordenada {
  latitud: number;
  longitud: number;
}

export interface IUbicacion extends Document {
  userId: string; // ID del usuario propietario
  nombre: string;
  tipo: 'potrero' | 'corral' | 'establo' | 'area_especial' | 'otro';
  capacidad?: number; // Número máximo de animales
  area?: number; // Área en hectáreas (calculada automáticamente si hay geometría)
  
  // GeoJSON - Geometría del polígono
  geometria?: IGeoJSONPolygon;
  
  // Coordenadas manuales (opcional, si se ingresa por puntos)
  coordenadas?: ICoordenada[];
  
  // Nuevos campos para potreros
  tipoPasto?: string; // Tipo de pasto
  sistemaRiego?: 'aspersion' | 'inundacion' | 'lluvia_temporal'; // Sistema de riego
  color?: string; // Color del polígono en el mapa (formato HEX, ej: #ff0000)
  
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
  
  // GeoJSON - Geometría del polígono
  geometria: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array de arrays de coordenadas [lng, lat]
      required: false
    }
  },
  
  // Coordenadas manuales (para entrada por puntos)
  coordenadas: [{
    latitud: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitud: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  }],
  
  // Nuevos campos para potreros
  tipoPasto: {
    type: String,
    trim: true
  },
  sistemaRiego: {
    type: String,
    enum: ['aspersion', 'inundacion', 'lluvia_temporal']
  },
  color: {
    type: String,
    trim: true,
    default: '#ffff00' // Amarillo por defecto
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

// Índice geoespacial 2dsphere para consultas geoespaciales
UbicacionSchema.index({ 'geometria': '2dsphere' });

// Middleware para actualizar fechaActualizacion
UbicacionSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

const Ubicacion = mongoose.models.Ubicacion || mongoose.model<IUbicacion>('Ubicacion', UbicacionSchema);

export default Ubicacion;

