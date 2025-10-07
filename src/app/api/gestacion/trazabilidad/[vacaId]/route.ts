import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gestacion from '@/models/Gestacion';
import Vaca from '@/models/Vaca';

// GET - Obtener trazabilidad completa de gestación de una vaca
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vacaId: string }> }
) {
  try {
    await connectDB();
    const { vacaId } = await params;

    // Obtener información de la vaca
    const vaca = await Vaca.findById(vacaId);
    if (!vaca) {
      return NextResponse.json(
        { error: 'Vaca no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todas las gestaciones de la vaca (incluyendo inactivas)
    const gestaciones = await Gestacion.find({ vacaId })
      .sort({ fechaServicio: -1 }) // Más recientes primero
      .lean();

    // Calcular estadísticas de la vaca
    const estadisticas = {
      totalGestaciones: gestaciones.length,
      partosExitosos: gestaciones.filter(g => g.estado === 'parto_exitoso').length,
      abortos: gestaciones.filter(g => g.estado === 'aborto').length,
      gestacionActual: gestaciones.find(g => g.estado === 'en_gestacion' && g.activa),
      primeraGestacion: gestaciones.length > 0 ? gestaciones[gestaciones.length - 1] : null,
      ultimaGestacion: gestaciones.length > 0 ? gestaciones[0] : null,
      intervaloEntrePartos: [] as number[]
    };

    // Calcular intervalos entre partos exitosos
    const partosExitosos = gestaciones
      .filter(g => g.estado === 'parto_exitoso' && g.fechaRealParto)
      .sort((a, b) => new Date(a.fechaRealParto!).getTime() - new Date(b.fechaRealParto!).getTime());

    for (let i = 1; i < partosExitosos.length; i++) {
      const fechaActual = new Date(partosExitosos[i].fechaRealParto!);
      const fechaAnterior = new Date(partosExitosos[i - 1].fechaRealParto!);
      const diasDiferencia = Math.floor((fechaActual.getTime() - fechaAnterior.getTime()) / (1000 * 60 * 60 * 24));
      estadisticas.intervaloEntrePartos.push(diasDiferencia);
    }

    // Crear timeline de eventos
    const timeline = gestaciones.map(gestacion => {
      const eventos = [];
      
      // Evento: Servicio
      eventos.push({
        fecha: gestacion.fechaServicio,
        tipo: 'servicio',
        titulo: `Servicio - ${gestacion.tipoServicio === 'monta_natural' ? 'Monta Natural' : 
                 gestacion.tipoServicio === 'inseminacion_artificial' ? 'Inseminación Artificial' : 
                 'Transferencia de Embrión'}`,
        descripcion: gestacion.toroPadre ? `Toro: ${gestacion.toroPadre}` : 'Sin información del toro',
        color: 'blue',
        icono: '🐂'
      });

      // Evento: Confirmación de gestación
      if (gestacion.fechaConfirmacion) {
        eventos.push({
          fecha: gestacion.fechaConfirmacion,
          tipo: 'confirmacion',
          titulo: 'Confirmación de Gestación',
          descripcion: `Método: ${gestacion.metodoConfirmacion || 'No especificado'}`,
          color: 'green',
          icono: '✅'
        });
      }

      // Evento: Fecha probable de parto
      eventos.push({
        fecha: gestacion.fechaProbableParto,
        tipo: 'fecha_probable_parto',
        titulo: 'Fecha Probable de Parto',
        descripcion: `Estado: ${gestacion.estado}`,
        color: gestacion.estado === 'en_gestacion' ? 'yellow' : 
               gestacion.estado === 'parto_exitoso' ? 'green' : 'red',
        icono: gestacion.estado === 'en_gestacion' ? '⏰' : 
               gestacion.estado === 'parto_exitoso' ? '🎉' : '❌'
      });

      // Evento: Parto real (si existe)
      if (gestacion.fechaRealParto) {
        eventos.push({
          fecha: gestacion.fechaRealParto,
          tipo: 'parto_real',
          titulo: 'Parto Real',
          descripcion: `Tipo: ${gestacion.tipoParto || 'No especificado'}${gestacion.pesoCria ? `, Peso cría: ${gestacion.pesoCria}kg` : ''}`,
          color: gestacion.estado === 'parto_exitoso' ? 'green' : 'red',
          icono: gestacion.estado === 'parto_exitoso' ? '👶' : '⚠️'
        });
      }

      // Agregar eventos del historial de gestación
      if (gestacion.historialGestacion && gestacion.historialGestacion.length > 0) {
        gestacion.historialGestacion.forEach((historial: any) => {
          eventos.push({
            fecha: historial.fecha,
            tipo: 'seguimiento',
            titulo: 'Seguimiento de Gestación',
            descripcion: historial.observaciones,
            color: 'gray',
            icono: '📋'
          });
        });
      }

      return {
        gestacionId: gestacion._id,
        estado: gestacion.estado,
        eventos: eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      };
    });

    // Flatten todos los eventos y ordenar por fecha
    const todosLosEventos = timeline.flatMap(t => t.eventos)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return NextResponse.json({
      vaca: {
        _id: vaca._id,
        numeroIdentificacion: vaca.numeroIdentificacion,
        nombre: vaca.nombre,
        fechaNacimiento: vaca.fechaNacimiento,
        raza: vaca.raza,
        sexo: vaca.sexo
      },
      estadisticas,
      gestaciones,
      timeline,
      eventos: todosLosEventos,
      resumen: {
        edadVaca: Math.floor((new Date().getTime() - new Date(vaca.fechaNacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365)),
        totalCrias: estadisticas.partosExitosos,
        productividad: estadisticas.partosExitosos / Math.max(estadisticas.totalGestaciones, 1) * 100,
        intervaloPromedio: estadisticas.intervaloEntrePartos.length > 0 ? 
          Math.round(estadisticas.intervaloEntrePartos.reduce((a, b) => a + b, 0) / estadisticas.intervaloEntrePartos.length) : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener trazabilidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
