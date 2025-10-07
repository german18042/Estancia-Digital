import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vaca from '@/models/Vaca';

// GET - Obtener estadísticas generales
export async function GET() {
  try {
    await connectDB();

    // Estadísticas básicas
    const totalVacas = await Vaca.countDocuments({ activa: true });
    const totalMachos = await Vaca.countDocuments({ sexo: 'macho', activa: true });
    const totalHembras = await Vaca.countDocuments({ sexo: 'hembra', activa: true });

    // Estadísticas por estado reproductivo
    const estadoReproductivo = await Vaca.aggregate([
      { $match: { activa: true } },
      {
        $group: {
          _id: '$estadoReproductivo',
          count: { $sum: 1 }
        }
      }
    ]);

    // Estadísticas por raza
    const razas = await Vaca.aggregate([
      { $match: { activa: true } },
      {
        $group: {
          _id: '$raza',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Estadísticas por ubicación
    const ubicaciones = await Vaca.aggregate([
      { $match: { activa: true } },
      {
        $group: {
          _id: '$ubicacionActual',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Estadísticas de edad
    const edades = await Vaca.aggregate([
      { $match: { activa: true } },
      {
        $project: {
          edad: {
            $divide: [
              { $subtract: [new Date(), '$fechaNacimiento'] },
              365 * 24 * 60 * 60 * 1000 // milisegundos en un año
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$edad',
          boundaries: [0, 2, 5, 10, 15, 20, 100],
          default: '20+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Producción promedio de leche
    const produccionPromedio = await Vaca.aggregate([
      {
        $match: {
          activa: true,
          produccionLecheraDiaria: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$produccionLecheraDiaria' },
          total: { $sum: '$produccionLecheraDiaria' }
        }
      }
    ]);

    // Peso promedio
    const pesoPromedio = await Vaca.aggregate([
      { $match: { activa: true } },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$peso' },
          minimo: { $min: '$peso' },
          maximo: { $max: '$peso' }
        }
      }
    ]);

    return NextResponse.json({
      resumen: {
        totalVacas,
        totalMachos,
        totalHembras
      },
      estadoReproductivo,
      razas,
      ubicaciones,
      edades,
      produccion: produccionPromedio[0] || { promedio: 0, total: 0 },
      peso: pesoPromedio[0] || { promedio: 0, minimo: 0, maximo: 0 }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
