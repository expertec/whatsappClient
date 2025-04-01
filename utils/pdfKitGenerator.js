import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Crea un PDF para el plan de marketing basado en el JSON generado por GPT.
 * La plantilla se inspira en el "Plan de marketing musical" y contiene secciones para:
 * - Portada
 * - Instrucciones
 * - Nombre/Logo del Proyecto
 * - Objetivos Cuantitativos y Cualitativos
 * - Key Marketing Ideas
 * - Audiencia Objetivo
 * - Conceptos Teóricos
 * - Posicionamiento
 * - Plan Estratégico de Marketing (Timeline y Estrategia de Comunicación)
 * - Información Adicional
 *
 * @param {string|object} strategyText - El plan de marketing generado por ChatGPT (en formato JSON o texto estructurado).
 * @param {object} leadData - Datos del lead (nombre del negocio, giro, descripción, etc.).
 * @returns {Promise<string>} - Ruta local del PDF generado.
 */
export async function createStrategyPDF(strategyText, leadData) {
  return new Promise((resolve, reject) => {
    const fileName = `plan-marketing-${leadData.id || Date.now()}.pdf`;
    const outputPath = path.join('/tmp', fileName);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Intentar parsear el strategyText como JSON; si falla, se usará como texto plano.
    let plan;
    try {
      plan = typeof strategyText === 'string' ? JSON.parse(strategyText) : strategyText;
    } catch (error) {
      plan = { titulo: "Plan de Marketing", instrucciones: strategyText };
    }

    // --- Portada ---
    doc.fontSize(24)
       .text(plan.titulo || "Plan de Marketing", { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(16)
       .text(leadData.negocio || "Nombre del Negocio", { align: "center" });
    doc.moveDown();
    doc.fontSize(12)
       .text(`Sector: ${leadData.giro || "General"}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12)
       .text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.addPage();

    // --- Instrucciones ---
    doc.fontSize(14).text("Instrucciones:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(plan.instrucciones || "Completa el siguiente plan de acuerdo a los objetivos de tu proyecto.", { align: "justify" });
    doc.moveDown();

    // --- Nombre/Logo del Proyecto ---
    doc.fontSize(14).text("[NOMBRE/LOGO DEL PROYECTO]", { align: "center" });
    doc.moveDown(1);

    // --- Objetivos Cuantitativos ---
    doc.fontSize(14).text("Objetivos Cuantitativos", { underline: true });
    doc.moveDown(0.5);
    if (plan.objetivosCuantitativos && Array.isArray(plan.objetivosCuantitativos)) {
      plan.objetivosCuantitativos.forEach(obj => {
        doc.fontSize(12).text(`➔ ${obj}`);
      });
    } else {
      doc.fontSize(12).text("_____________________________");
      doc.fontSize(12).text("_____________________________");
      doc.fontSize(12).text("_____________________________");
    }
    doc.moveDown();

    // --- Objetivos Cualitativos ---
    doc.fontSize(14).text("Objetivos Cualitativos", { underline: true });
    doc.moveDown(0.5);
    if (plan.objetivosCualitativos && Array.isArray(plan.objetivosCualitativos)) {
      plan.objetivosCualitativos.forEach(obj => {
        doc.fontSize(12).text(`➔ ${obj}`);
      });
    } else {
      doc.fontSize(12).text("_____________________________");
      doc.fontSize(12).text("_____________________________");
      doc.fontSize(12).text("_____________________________");
    }
    doc.moveDown();

    // --- Key Marketing Ideas ---
    doc.fontSize(14).text("Key Marketing Ideas", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(plan.keyMarketingIdeas || "_____________________________", { align: "justify" });
    doc.moveDown();

    // --- Audiencia Objetivo ---
    doc.fontSize(14).text("Audiencia Objetivo", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(plan.audienciaObjetivo || "_____________________________", { align: "justify" });
    doc.moveDown();

    // --- Conceptos Teóricos ---
    doc.fontSize(14).text("Conceptos Teóricos", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(plan.conceptosTeoricos || "_____________________________", { align: "justify" });
    doc.moveDown();

    // --- Posicionamiento ---
    doc.fontSize(14).text("Posicionamiento", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(plan.posicionamiento || "_____________________________", { align: "justify" });
    doc.moveDown();

    // --- Plan Estratégico de Marketing ---
    doc.fontSize(14).text("Plan Estratégico de Marketing", { underline: true });
    doc.moveDown(0.5);
    if (plan.planEstrategico && plan.planEstrategico.timeline && Array.isArray(plan.planEstrategico.timeline)) {
      plan.planEstrategico.timeline.forEach(phase => {
        doc.fontSize(13).text(`${phase.fase}:`, { underline: true });
        doc.moveDown(0.3);
        if (phase.acciones && Array.isArray(phase.acciones)) {
          phase.acciones.forEach(action => {
            doc.fontSize(12).list([
              `Fecha: ${action.fecha || "dd/mm/aa"}`,
              `Actividad: ${action.actividad || "Detalle de la acción"}`
            ]);
            doc.moveDown(0.5);
          });
        }
        doc.moveDown();
      });
    } else {
      doc.fontSize(12).text("No se ha definido un plan estratégico.", { align: "justify" });
    }
    doc.moveDown();

    // --- Estrategia de Comunicación ---
    doc.fontSize(14).text("Estrategia de Comunicación", { underline: true });
    doc.moveDown(0.5);
    if (plan.planEstrategico && plan.planEstrategico.estrategiaComunicacion) {
      doc.fontSize(12).text(plan.planEstrategico.estrategiaComunicacion, { align: "justify" });
    } else {
      doc.fontSize(12).text("_____________________________", { align: "justify" });
    }
    doc.moveDown();

    // --- Información Adicional ---
    doc.fontSize(14).text("Información Adicional", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(plan.informacionAdicional || "_____________________________", { align: "justify" });
    doc.moveDown();

    // --- Pie de Página ---
    doc.moveDown(2);
    doc.fontSize(10).text("Documento generado automáticamente. Revise y ajuste la estrategia según sea necesario.", { align: "center" });

    doc.end();
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", err => reject(err));
  });
}
