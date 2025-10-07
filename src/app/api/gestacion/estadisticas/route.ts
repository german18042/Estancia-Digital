import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gestacion from '@/models/Gestacion';

// GET - Obtener estadísticas de gestación
export async function GET() {
  try {
    await connectDB();

    // Estadísticas básicas
    const totalGestaciones = await Gestacion.countDocuments({ activa: true });
    const gestacionesActivas = await Gestacion.countDocuments({ 
      estado: 'en_gestacion', 
      activa: true 
    });
    const partosExitosos = await Gestacion.countDocuments({ 
      estado: 'parto_exitoso', 
      activa: true 
    });
    const abortos = await Gestacion.countDocuments({ 
      estado: 'aborto', 
      activa: true 
    });

    // Estadísticas por trimestre
    const trimestres = await Gestacion.aggregate([
      { 
        $match: { 
          activa: true, 
          estado: 'en_gestacion' 
        } 
      },
      {
        $group: {
          _id: '$trimestreActual',
          count: { $sum: 1 }
        }
      }
    ]);

    // Gestaciones cerca del parto (últimos 30 días)
    const hoy = new Date();
    const fechaLimite = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const cercaDelParto = await Gestacion.countDocuments({
      fechaProbableParto: { $lte: fechaLimite, $gte: hoy },
      estado: 'en_gestacion',
      activa: true
    });

    // Gestaciones en período crítico (últimos 14 días)
    const fechaLimiteCritica = new Date(hoy.getTime() + (14 * 24 * 60 * 60 * 1000));
    
    const periodoCritico = await Gestacion.countDocuments({
      fechaProbableParto: { $lte: fechaLimiteCritica, $gte: hoy },
      estado: 'en_gestacion',
      activa: true
    });

    // Estadísticas por tipo de servicio
    const tiposServicio = await Gestacion.aggregate([
      { $match: { activa: true } },
      {
        $group: {
          _id: '$tipoServicio',
          count: { $sum: 1 }
        }
      }
    ]);

    // Estadísticas por mes del año
    const gestacionesPorMes = await Gestacion.aggregate([
      { $match: { activa: true } },
      {
        $group: {
          _id: {
            $month: '$fechaServicio'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Próximos partos (próximos 30 días)
    const proximosPartos = await Gestacion.find({
      fechaProbableParto: { $lte: fechaLimite, $gte: hoy },
      estado: 'en_gestacion',
      activa: true
    })
    .select('numeroIdentificacionVaca nombreVaca fechaProbableParto diasGestacionActual')
    .sort({ fechaProbableParto: 1 })
    .limit(10)
    .lean();

    return NextResponse.json({
      resumen: {
        totalGestaciones,
        gestacionesActivas,
        partosExitosos,
        abortos,
        cercaDelParto,
        periodoCritico
      },
      trimestres,
      tiposServicio,
      gestacionesPorMes,
      proximosPartos
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de gestación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

