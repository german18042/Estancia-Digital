interface ProduccionLechera {
  numeroIdentificacionVaca: string;
  nombreVaca?: string;
  fecha: string;
  ordenoManana?: number;
  ordenoTarde?: number;
  ordenoNoche?: number;
  totalDia: number;
  grasa?: number;
  proteina?: number;
  celulasSomaticas?: number;
  observaciones?: string;
  anomalias?: string;
}

export function generarReporteCSV(
  producciones: ProduccionLechera[],
  fechaInicio: string,
  fechaFin: string
): void {
  if (producciones.length === 0) {
    alert('No hay datos para generar el reporte');
    return;
  }

  // Calcular estadísticas
  const totalLitros = producciones.reduce((sum, p) => sum + p.totalDia, 0);
  const promedio = totalLitros / producciones.length;
  const maxProduccion = Math.max(...producciones.map(p => p.totalDia));
  const minProduccion = Math.min(...producciones.map(p => p.totalDia));

  // Crear encabezado del CSV
  let csv = '\uFEFF'; // BOM para UTF-8
  csv += '=== REPORTE DE PRODUCCIÓN LECHERA ===\n';
  csv += `Período: ${new Date(fechaInicio).toLocaleDateString()} - ${new Date(fechaFin).toLocaleDateString()}\n`;
  csv += `Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  csv += '\n';
  
  // Estadísticas generales
  csv += '=== RESUMEN GENERAL ===\n';
  csv += `Total Registros:,${producciones.length}\n`;
  csv += `Total Litros:,${totalLitros.toFixed(2)} L\n`;
  csv += `Promedio Diario:,${promedio.toFixed(2)} L\n`;
  csv += `Producción Máxima:,${maxProduccion.toFixed(2)} L\n`;
  csv += `Producción Mínima:,${minProduccion.toFixed(2)} L\n`;
  csv += '\n';

  // Producción por vaca
  csv += '=== PRODUCCIÓN POR VACA ===\n';
  const produccionPorVaca = new Map<string, {
    nombre?: string;
    total: number;
    registros: number;
    promedio: number;
  }>();

  producciones.forEach(p => {
    const key = p.numeroIdentificacionVaca;
    if (!produccionPorVaca.has(key)) {
      produccionPorVaca.set(key, {
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

  csv += 'Vaca,Nombre,Total Litros,Días Registrados,Promedio Diario\n';
  Array.from(produccionPorVaca.entries())
    .sort(([, a], [, b]) => b.total - a.total)
    .forEach(([id, data]) => {
      csv += `${id},${data.nombre || 'Sin nombre'},${data.total.toFixed(2)},${data.registros},${data.promedio.toFixed(2)}\n`;
    });
  
  csv += '\n';

  // Detalle diario
  csv += '=== DETALLE DIARIO ===\n';
  csv += 'Fecha,Vaca,Nombre,Mañana (L),Tarde (L),Noche (L),Total (L),Grasa (%),Proteína (%),Células Somáticas,Observaciones,Anomalías\n';
  
  producciones
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .forEach(p => {
      const fecha = new Date(p.fecha).toLocaleDateString();
      const manana = p.ordenoManana?.toFixed(2) || '0.00';
      const tarde = p.ordenoTarde?.toFixed(2) || '0.00';
      const noche = p.ordenoNoche?.toFixed(2) || '0.00';
      const total = p.totalDia.toFixed(2);
      const grasa = p.grasa?.toFixed(2) || '-';
      const proteina = p.proteina?.toFixed(2) || '-';
      const celulas = p.celulasSomaticas || '-';
      const obs = (p.observaciones || '').replace(/,/g, ';'); // Reemplazar comas para no romper CSV
      const anom = (p.anomalias || '').replace(/,/g, ';');
      
      csv += `${fecha},${p.numeroIdentificacionVaca},${p.nombreVaca || '-'},${manana},${tarde},${noche},${total},${grasa},${proteina},${celulas},"${obs}","${anom}"\n`;
    });

  // Crear y descargar archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const nombreArchivo = `reporte_produccion_${fechaInicio}_a_${fechaFin}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpiar URL
  URL.revokeObjectURL(url);
}

export function generarReporteExcel(
  producciones: ProduccionLechera[],
  fechaInicio: string,
  fechaFin: string
): void {
  // Por ahora usaremos CSV que Excel puede abrir
  // En el futuro se puede integrar una librería como xlsx
  generarReporteCSV(producciones, fechaInicio, fechaFin);
}

