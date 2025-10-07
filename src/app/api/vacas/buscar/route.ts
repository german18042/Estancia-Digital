import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vaca from '@/models/Vaca';

interface FiltrosBusqueda {
  numeroIdentificacion?: RegExp;
  nombre?: RegExp;
  raza?: RegExp;
  sexo?: string;
  estadoReproductivo?: string;
  ubicacionActual?: RegExp;
  fechaNacimiento?: {
    $gte?: Date;
    $lte?: Date;
  };
  peso?: {
    $gte?: number;
    $lte?: number;
  };
  condicionCorporal?: number;
  activa: boolean;
}

// POST - Buscar vacas con filtros avanzados
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      numeroIdentificacion,
      nombre,
      raza,
      sexo,
      estadoReproductivo,
      ubicacionActual,
      fechaNacimientoDesde,
      fechaNacimientoHasta,
      pesoMinimo,
      pesoMaximo,
      condicionCorporal,
      activa = true
    } = body;

    // Construir filtros de búsqueda
    const filtros: FiltrosBusqueda = { activa };

    if (numeroIdentificacion) {
      filtros.numeroIdentificacion = new RegExp(numeroIdentificacion, 'i');
    }

    if (nombre) {
      filtros.nombre = new RegExp(nombre, 'i');
    }

    if (raza) {
      filtros.raza = new RegExp(raza, 'i');
    }

    if (sexo) {
      filtros.sexo = sexo;
    }

    if (estadoReproductivo) {
      filtros.estadoReproductivo = estadoReproductivo;
    }

    if (ubicacionActual) {
      filtros.ubicacionActual = new RegExp(ubicacionActual, 'i');
    }

    if (fechaNacimientoDesde || fechaNacimientoHasta) {
      filtros.fechaNacimiento = {};
      if (fechaNacimientoDesde) {
        filtros.fechaNacimiento.$gte = new Date(fechaNacimientoDesde);
      }
      if (fechaNacimientoHasta) {
        filtros.fechaNacimiento.$lte = new Date(fechaNacimientoHasta);
      }
    }

    if (pesoMinimo || pesoMaximo) {
      filtros.peso = {};
      if (pesoMinimo) {
        filtros.peso.$gte = pesoMinimo;
      }
      if (pesoMaximo) {
        filtros.peso.$lte = pesoMaximo;
      }
    }

    if (condicionCorporal) {
      filtros.condicionCorporal = condicionCorporal;
    }

    filtros.activa = activa;

    const vacas = await Vaca.find(filtros)
      .sort({ fechaRegistro: -1 })
      .lean();

    return NextResponse.json({ vacas });
  } catch (error) {
    console.error('Error en búsqueda de vacas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
