import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Crea un PDF para el plan de ventas en Facebook basado en el JSON generado por ChatGPT.
 * La plantilla se adapta a cada negocio e incluye las siguientes secciones:
 *
 * 1. Portada: Título y Datos del Negocio
 * 2. Objetivos del Plan
 * 3. Público Objetivo
 * 4. Estrategias de Marketing en Facebook
 * 5. Calendario de Contenidos y Anuncios (15 Días)
 * 6. Presupuesto y KPIs
 * 7. Herramientas e Integración
 *
 * @param {string|object} strategyText - El plan generado por ChatGPT (en formato JSON o texto estructurado).
 * @param {object} leadData - Datos del lead:
 *   {
 *     negocio: "SP Playeras",
 *     giro: "Venta de Ropa",
 *     descripcion: "Venta de ropa al mayoreo",
 *     nombre: "Michel Perez",
 *     telefono: "8311760335",
 *     ...
 *   }
 * @returns {Promise<string>} - Ruta local del PDF generado.
 */
export async function createStrategyPDF(strategyText, leadData) {
  return new Promise((resolve, reject) => {
    const fileName = `plan-ventas-${leadData.id || Date.now()}.pdf`;
    const outputPath = path.join('/tmp', fileName);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Intentar parsear el strategyText como JSON; si falla, se usa como texto plano.
    let plan;
    try {
      plan = typeof strategyText === 'string' ? JSON.parse(strategyText) : strategyText;
    } catch (error) {
      plan = { titulo: "Plan de Ventas para Facebook", instrucciones: strategyText };
    }

    // --- 1. Portada: Título y Datos del Negocio ---
    doc.fontSize(20)
       .text(plan.titulo || "Plan de Ventas para Facebook", { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(14)
       .text(`Negocio: ${leadData.negocio || "N/D"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Sector (Giro): ${leadData.giro || "General"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Descripción: ${leadData.descripcion || "Sin descripción"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Contacto: ${leadData.nombre || "Sin nombre"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Teléfono: ${leadData.telefono || "Sin teléfono"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    // --- 2. Objetivos del Plan ---
    doc.fontSize(16).text("1. Objetivos del Plan", { underline: true });
    doc.moveDown(0.5);
    if (plan.objetivosPlan) {
      const obj = plan.objetivosPlan;
      doc.fontSize(12)
         .text("• Incrementar las Ventas:", { continued: true })
         .font('Helvetica-Bold')
         .text(` ${obj.incrementarVentas}`);
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica')
         .text("• Fortalecer la Marca:", { continued: true })
         .font('Helvetica-Bold')
         .text(` ${obj.fortalecerMarca}`);
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica')
         .text("• Fidelizar Clientes:", { continued: true })
         .font('Helvetica-Bold')
         .text(` ${obj.fidelizarClientes}`);
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica')
         .text("• Generar Leads Calificados:", { continued: true })
         .font('Helvetica-Bold')
         .text(` ${obj.generarLeads}`);
    }
    doc.moveDown(1);

    // --- 3. Público Objetivo ---
    doc.fontSize(16).text("2. Público Objetivo", { underline: true });
    doc.moveDown(0.5);
    if (plan.publicoObjetivo && Array.isArray(plan.publicoObjetivo)) {
      plan.publicoObjetivo.forEach(item => {
        doc.fontSize(12).text(`• ${item}`);
      });
    }
    doc.moveDown(1);

    // --- 4. Estrategias de Marketing en Facebook (2025) ---
    doc.fontSize(16).text("3. Estrategias de Marketing en Facebook (2025)", { underline: true });
    doc.moveDown(0.5);
    if (plan.estrategiasMarketing) {
      doc.fontSize(12).text("a) Contenido Orgánico y Multimedia:", { underline: true });
      doc.fontSize(12).text(plan.estrategiasMarketing.contenidoOrganicoMultimedia);
      doc.moveDown(0.5);
      doc.fontSize(12).text("b) Publicidad Pagada y Segmentación Inteligente:", { underline: true });
      doc.fontSize(12).text(plan.estrategiasMarketing.publicidadPagadaSegmentacion);
      doc.moveDown(0.5);
      doc.fontSize(12).text("c) Integración de Herramientas y Automatización:", { underline: true });
      doc.fontSize(12).text(plan.estrategiasMarketing.integracionHerramientasAutomatizacion);
      doc.moveDown(0.5);
      doc.fontSize(12).text("d) Tendencias Clave para 2025:", { underline: true });
      doc.fontSize(12).text(plan.estrategiasMarketing.tendenciasClave);
    }
    doc.moveDown(1);

    // --- 5. Calendario de Contenidos y Anuncios (15 Días) ---
    doc.fontSize(16).text("4. Calendario de Contenidos y Anuncios (15 Días)", { underline: true });
    doc.moveDown(0.5);
    if (plan.calendarioContenidos && Array.isArray(plan.calendarioContenidos)) {
      plan.calendarioContenidos.forEach(day => {
        doc.fontSize(13).fillColor('blue').text(day.dia, { underline: true });
        doc.moveDown(0.3);
        doc.fillColor('black').fontSize(12).text("Contenido Orgánico:");
        doc.fontSize(12).text(day.contenidoOrganico || "N/D", { indent: 20 });
        if (day.objetivo) {
          doc.moveDown(0.2);
          doc.fontSize(12).text("Objetivo:", { indent: 20 });
          doc.fontSize(12).text(day.objetivo, { indent: 40 });
        }
        if (day.anuncio) {
          doc.moveDown(0.2);
          doc.fontSize(12).text("Anuncio:", { indent: 20 });
          doc.fontSize(12).text(day.anuncio, { indent: 40 });
        }
        doc.moveDown(1);
      });
    }
    doc.moveDown(1);

    // --- 6. Presupuesto y KPIs ---
    doc.fontSize(16).text("5. Presupuesto y KPIs", { underline: true });
    doc.moveDown(0.5);
    if (plan.presupuestoKPIs) {
      doc.fontSize(12).text("Presupuesto Publicitario:");
      doc.fontSize(12).text(plan.presupuestoKPIs.presupuestoPublicitario, { indent: 20 });
      doc.moveDown(0.5);
      doc.fontSize(12).text("KPIs Clave a Monitorear:");
      if (plan.presupuestoKPIs.KPIs && Array.isArray(plan.presupuestoKPIs.KPIs)) {
        plan.presupuestoKPIs.KPIs.forEach(kpi => {
          doc.fontSize(12).text(`• ${kpi}`, { indent: 20 });
        });
      }
    }
    doc.moveDown(1);

    // --- 7. Herramientas e Integración ---
    doc.fontSize(16).text("6. Herramientas e Integración", { underline: true });
    doc.moveDown(0.5);
    if (plan.herramientasIntegracion) {
      Object.keys(plan.herramientasIntegracion).forEach(key => {
        const label = key === "metaBusinessSuite" ? "Meta Business Suite" :
                      key === "crmAutomatizacion" ? "CRM y Automatización" :
                      key === "estrategiaOmnicanal" ? "Estrategia Omnicanal" :
                      key === "socialListening" ? "Social Listening" : key;
        doc.fontSize(12).text(`${label}:`, { underline: true });
        doc.fontSize(12).text(plan.herramientasIntegracion[key], { indent: 20 });
        doc.moveDown(0.5);
      });
    }
    doc.moveDown(2);

    // --- Pie de Página ---
    doc.fontSize(10).text("Documento generado automáticamente. Revise y ajuste la estrategia según sea necesario.", { align: "center" });

    doc.end();
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", err => reject(err));
  });
}
