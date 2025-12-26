import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistroSanitario from '@/models/RegistroSanitario';
import { requireAuth } from '@/utils/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const dias = parseInt(searchParams.get('dias') || '30');

    // Fecha límite (hoy + X días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);
    fechaLimite.setHours(23, 59, 59, 999);

    // Obtener procedimientos pendientes
    const proximosProcedimientos = await RegistroSanitario.find({
      userId: user.userId,
      proximaFecha: {
        $exists: true,
        $ne: null,
        $lte: fechaLimite
      },
      completado: false
    })
      .sort({ proximaFecha: 1 })
      .lean();

    // Agrupar por urgencia
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const vencidos = proximosProcedimientos.filter(p => {
      const fecha = new Date(p.proximaFecha!);
      return fecha < hoy;
    });

    const proximasSemana = proximosProcedimientos.filter(p => {
      const fecha = new Date(p.proximaFecha!);
      const en7Dias = new Date(hoy);
      en7Dias.setDate(en7Dias.getDate() + 7);
      return fecha >= hoy && fecha <= en7Dias;
    });

    const proximoMes = proximosProcedimientos.filter(p => {
      const fecha = new Date(p.proximaFecha!);
      const en7Dias = new Date(hoy);
      en7Dias.setDate(en7Dias.getDate() + 7);
      const en30Dias = new Date(hoy);
      en30Dias.setDate(en30Dias.getDate() + 30);
      return fecha > en7Dias && fecha <= en30Dias;
    });

    return NextResponse.json({
      total: proximosProcedimientos.length,
      vencidos: {
        cantidad: vencidos.length,
        procedimientos: vencidos
      },
      proximasSemana: {
        cantidad: proximasSemana.length,
        procedimientos: proximasSemana
      },
      proximoMes: {
        cantidad: proximoMes.length,
        procedimientos: proximoMes
      }
    });
  } catch (error) {
    console.error('Error al obtener próximos procedimientos:', error);
    if (error instanceof Error && error.message === 'No autorizado') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

