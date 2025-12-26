import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProduccionLechera from '@/models/ProduccionLechera';
import { requireAuth } from '@/utils/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const vacaId = searchParams.get('vacaId');
    const dias = parseInt(searchParams.get('dias') || '30');

    // Fecha de inicio (hace X días)
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    fechaInicio.setHours(0, 0, 0, 0);

    // Filtros base
    const filtros: Record<string, unknown> = {
      userId: user.userId,
      fecha: { $gte: fechaInicio }
    };

    if (vacaId) {
      filtros.vacaId = vacaId;
    }

    // Obtener todos los registros del período
    const producciones = await ProduccionLechera.find(filtros)
      .sort({ fecha: -1 })
      .lean();

    // Calcular estadísticas
    const totalLitros = producciones.reduce((sum, p) => sum + p.totalDia, 0);
    const totalRegistros = producciones.length;
    const promedioDiario = totalRegistros > 0 ? totalLitros / totalRegistros : 0;

    // Producción por vaca
    const produccionPorVaca = new Map<string, { 
      numeroIdentificacion: string;
      nombre?: string;
      total: number;
      registros: number;
      promedio: number;
    }>();

    producciones.forEach(p => {
      const key = p.vacaId.toString();
      if (!produccionPorVaca.has(key)) {
        produccionPorVaca.set(key, {
          numeroIdentificacion: p.numeroIdentificacionVaca,
          nombre: p.nombreVaca,
          total: 0,
          registros: 0,
          promedio: 0
        });
      }
      const vaca = produccionPorVaca.get(key)!;
      vaca.total += p.totalDia;
      vaca.registros += 1;
      vaca.promedio = vaca.total / vaca.registros;
    });

    // Convertir a array y ordenar por producción
    const topVacas = Array.from(produccionPorVaca.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Producción diaria (últimos 30 días para gráfico)
    const produccionDiaria = [];
    const diasParaGrafico = Math.min(dias, 30);
    
    for (let i = diasParaGrafico - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);
      
      const fechaSiguiente = new Date(fecha);
      fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);
      
      const produccionesDia = producciones.filter(p => {
        const fechaProduccion = new Date(p.fecha);
        return fechaProduccion >= fecha && fechaProduccion < fechaSiguiente;
      });
      
      const totalDia = produccionesDia.reduce((sum, p) => sum + p.totalDia, 0);
      
      produccionDiaria.push({
        fecha: fecha.toISOString().split('T')[0],
        total: totalDia,
        promedio: produccionesDia.length > 0 ? totalDia / produccionesDia.length : 0
      });
    }

    // Máximo y mínimo
    const maxProduccion = producciones.length > 0 
      ? Math.max(...producciones.map(p => p.totalDia)) 
      : 0;
    const minProduccion = producciones.length > 0 
      ? Math.min(...producciones.map(p => p.totalDia)) 
      : 0;

    return NextResponse.json({
      resumen: {
        totalLitros,
        totalRegistros,
        promedioDiario: parseFloat(promedioDiario.toFixed(2)),
        maxProduccion,
        minProduccion,
        periodo: dias
      },
      topVacas,
      produccionDiaria
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

