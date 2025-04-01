// server/utils/pdfKitGenerator.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Crea un PDF con la estrategia de marketing y calendario de contenido.
 * @param {string} strategyText - Texto generado por ChatGPT con la estrategia, idealmente en formato JSON.
 * @param {object} leadData - Datos del lead (negocio, giro, descripción, etc.).
 * @returns {Promise<string>} - Ruta local del PDF generado.
 */
export async function createStrategyPDF(strategyText, leadData) {
  return new Promise((resolve, reject) => {
    // Genera un nombre de archivo único
    const fileName = `estrategia-${leadData.id || Date.now()}.pdf`;
    // Usamos la carpeta temporal /tmp (útil en entornos de despliegue como Render)
    const outputPath = path.join('/tmp', fileName);
    // Creamos el documento PDF con márgenes adecuados
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // TÍTULO Y DATOS DEL NEGOCIO
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text("Estrategia de Marketing y Calendario de Contenido", {
         align: "center",
         underline: true,
       });
    doc.moveDown();

    doc.fontSize(16)
       .font('Helvetica')
       .text(`Negocio: ${leadData.negocio || "—"}`, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14)
       .text(`Giro: ${leadData.giro || "—"}`, { align: "center" });
    doc.moveDown(0.5);
    if (leadData.descripcion) {
      doc.fontSize(12)
         .text(`Descripción: ${leadData.descripcion}`, {
           align: "center",
           width: 500,
         });
    }
    doc.moveDown(2);

    // INTENTAR PARSEAR EL TEXTO DE LA ESTRATEGIA COMO JSON
    let strategyObj = null;
    try {
      strategyObj = JSON.parse(strategyText);
    } catch (error) {
      console.error("La estrategia no es un JSON válido, se usará como texto plano.", error);
    }

    // RESUMEN DE LA ESTRATEGIA
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text("Resumen de Estrategia:", { underline: true });
    doc.moveDown();
    if (strategyObj && strategyObj.strategy) {
      doc.fontSize(12)
         .font('Helvetica')
         .text(strategyObj.strategy, {
           align: "justify",
           lineGap: 4,
         });
    } else {
      // Si no se puede parsear, usar el texto completo
      doc.fontSize(12)
         .font('Helvetica')
         .text(strategyText, {
           align: "justify",
           lineGap: 4,
         });
    }
    doc.moveDown(2);

    // CALENDARIO DE CONTENIDO
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text("Calendario de Contenido:", { underline: true });
    doc.moveDown();

    if (strategyObj && strategyObj.contentCalendar && Array.isArray(strategyObj.contentCalendar)) {
      // Crear una tabla con columnas: Día, Tema, Descripción, CTA
      const tableTop = doc.y;
      const marginLeft = 50;
      const colWidths = [80, 100, 220, 100]; // Ajusta los anchos según sea necesario

      // Encabezados
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text("Día", marginLeft, tableTop, { width: colWidths[0] });
      doc.text("Tema", marginLeft + colWidths[0], tableTop, { width: colWidths[1] });
      doc.text("Descripción", marginLeft + colWidths[0] + colWidths[1], tableTop, { width: colWidths[2] });
      doc.text("CTA", marginLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop, { width: colWidths[3] });
      doc.moveDown();
      doc.font('Helvetica');

      // Filas del calendario
      strategyObj.contentCalendar.forEach((item, index) => {
        const y = tableTop + 25 + (index * 20);
        doc.text(item.day || "—", marginLeft, y, { width: colWidths[0] });
        doc.text(item.topic || "—", marginLeft + colWidths[0], y, { width: colWidths[1] });
        doc.text(item.description || "—", marginLeft + colWidths[0] + colWidths[1], y, { width: colWidths[2] });
        doc.text(item.callToAction || "—", marginLeft + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3] });
      });
      doc.moveDown(2);
    } else {
      // Calendario genérico de 4 semanas
      const weeks = 4;
      const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
      for (let week = 1; week <= weeks; week++) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(`Semana ${week}:`);
        doc.moveDown(0.5);
        days.forEach((day) => {
          doc.fontSize(10)
             .font('Helvetica')
             .text(`${day}: [Plan de contenido sugerido]`, { indent: 20 });
        });
        doc.moveDown(1);
      }
    }

    // PIE DE PÁGINA
    doc.moveDown(2);
    doc.fontSize(10)
       .font('Helvetica')
       .text("Este documento es generado automáticamente. Revise y ajuste la estrategia según sea necesario.", {
         align: "center",
       });

    doc.end();
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", (err) => reject(err));
  });
}
