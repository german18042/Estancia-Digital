import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vaca from '@/models/Vaca';
import Gestacion from '@/models/Gestacion';
import ProduccionLechera from '@/models/ProduccionLechera';
import RegistroSanitario from '@/models/RegistroSanitario';
import { requireAuth } from '@/utils/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);

    // Fechas para filtros
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    // ========== ESTADÍSTICAS DE VACAS ==========
    const [totalVacas, vacasActivas, vacasGestantes] = await Promise.all([
      Vaca.countDocuments({ userId: user.userId }),
      Vaca.countDocuments({ userId: user.userId, activa: true }),
      Vaca.countDocuments({ 
        userId: user.userId, 
        activa: true,
        estadoReproductivo: 'gestante'
      })
    ]);

    const vacasLactantes = await Vaca.countDocuments({
      userId: user.userId,
      activa: true,
      estadoReproductivo: 'lactante'
    });

    // ========== ESTADÍSTICAS DE GESTACIÓN ==========
    const [gestacionesActivas, gestacionesCriticas, gestacionesProximas] = await Promise.all([
      Gestacion.countDocuments({
        userId: user.userId,
        estado: 'en_gestacion',
        activa: true
      }),
      // Críticas: 0-14 días para parir
      Gestacion.countDocuments({
        userId: user.userId,
        estado: 'en_gestacion',
        activa: true,
        diasGestacionActual: { $gte: 269, $lte: 283 }
      }),
      // Próximas: 15-30 días para parir
      Gestacion.countDocuments({
        userId: user.userId,
        estado: 'en_gestacion',
        activa: true,
        diasGestacionActual: { $gte: 253, $lt: 269 }
      })
    ]);

    // Próximos partos (detalles)
    const proximosPartos = await Gestacion.find({
      userId: user.userId,
      estado: 'en_gestacion',
      activa: true,
      diasGestacionActual: { $gte: 253 }
    })
      .sort({ fechaProbableParto: 1 })
      .limit(5)
      .select('numeroIdentificacionVaca nombreVaca fechaProbableParto diasGestacionActual')
      .lean();

    // ========== ESTADÍSTICAS DE PRODUCCIÓN LECHERA ==========
    const produccionesUltimos30Dias = await ProduccionLechera.find({
      userId: user.userId,
      fecha: { $gte: hace30Dias }
    }).lean();

    const produccionesUltimos7Dias = await ProduccionLechera.find({
      userId: user.userId,
      fecha: { $gte: hace7Dias }
    }).lean();

    const totalLitros30Dias = produccionesUltimos30Dias.reduce((sum, p) => sum + p.totalDia, 0);
    const totalLitros7Dias = produccionesUltimos7Dias.reduce((sum, p) => sum + p.totalDia, 0);
    const promedioDiario30Dias = produccionesUltimos30Dias.length > 0 
      ? totalLitros30Dias / 30 
      : 0;
    const promedioDiario7Dias = produccionesUltimos7Dias.length > 0 
      ? totalLitros7Dias / 7 
      : 0;

    // Top 5 vacas productoras
    const produccionPorVaca = new Map<string, {
      vacaId: string;
      numeroIdentificacion: string;
      nombre?: string;
      total: number;
    }>();

    produccionesUltimos30Dias.forEach(p => {
      const key = p.vacaId.toString();
      if (!produccionPorVaca.has(key)) {
        produccionPorVaca.set(key, {
          vacaId: key,
          numeroIdentificacion: p.numeroIdentificacionVaca,
          nombre: p.nombreVaca,
          total: 0
        });
      }
      produccionPorVaca.get(key)!.total += p.totalDia;
    });

    const topProductoras = Array.from(produccionPorVaca.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // ========== ESTADÍSTICAS SANITARIAS ==========
    const [procedimientosPendientes, procedimientosVencidos] = await Promise.all([
      RegistroSanitario.countDocuments({
        userId: user.userId,
        completado: false,
        proximaFecha: { $exists: true, $ne: null }
      }),
      RegistroSanitario.countDocuments({
        userId: user.userId,
        completado: false,
        proximaFecha: { $exists: true, $lt: hoy }
      })
    ]);

    // Próximos procedimientos (detalles)
    const proximosProcedimientos = await RegistroSanitario.find({
      userId: user.userId,
      completado: false,
      proximaFecha: {
        $exists: true,
        $gte: hoy
      }
    })
      .sort({ proximaFecha: 1 })
      .limit(5)
      .select('tipo nombre numeroIdentificacionVaca nombreVaca proximaFecha')
      .lean();

    // ========== GRÁFICO DE PRODUCCIÓN (últimos 7 días) ==========
    const produccionDiaria = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaSiguiente = new Date(fecha);
      fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);
      
      const produccionesDia = produccionesUltimos7Dias.filter(p => {
        const fechaP = new Date(p.fecha);
        return fechaP >= fecha && fechaP < fechaSiguiente;
      });
      
      const totalDia = produccionesDia.reduce((sum, p) => sum + p.totalDia, 0);
      
      produccionDiaria.push({
        fecha: fecha.toISOString().split('T')[0],
        total: parseFloat(totalDia.toFixed(2))
      });
    }

    // ========== RESPUESTA FINAL ==========
    return NextResponse.json({
      vacas: {
        total: totalVacas,
        activas: vacasActivas,
        gestantes: vacasGestantes,
        lactantes: vacasLactantes,
        inactivas: totalVacas - vacasActivas
      },
      gestacion: {
        activas: gestacionesActivas,
        criticas: gestacionesCriticas,
        proximas: gestacionesProximas,
        proximosPartos
      },
      produccionLechera: {
        totalLitros30Dias: parseFloat(totalLitros30Dias.toFixed(2)),
        totalLitros7Dias: parseFloat(totalLitros7Dias.toFixed(2)),
        promedioDiario30Dias: parseFloat(promedioDiario30Dias.toFixed(2)),
        promedioDiario7Dias: parseFloat(promedioDiario7Dias.toFixed(2)),
        topProductoras,
        produccionDiaria
      },
      sanitario: {
        procedimientosPendientes,
        procedimientosVencidos,
        proximosProcedimientos
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

