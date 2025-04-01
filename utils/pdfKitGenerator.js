// server/utils/pdfKitGenerator.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Crea un PDF con la estrategia de marketing y calendario de contenido.
 * @param {string} strategyText - Texto generado por ChatGPT con la estrategia.
 * @param {object} leadData - Datos del lead (negocio, giro, descripción, etc.).
 * @returns {Promise<string>} - Ruta local del PDF generado.
 */
export async function createStrategyPDF(strategyText, leadData) {
  return new Promise((resolve, reject) => {
    // Se genera un nombre de archivo único
    const fileName = `estrategia-${leadData.id || Date.now()}.pdf`;
    // Usamos la carpeta temporal /tmp (útil en entornos de despliegue como Render)
    const outputPath = path.join('/tmp', fileName);
    // Creamos el documento PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // TÍTULO Y DATOS DEL NEGOCIO
    doc
      .fontSize(20)
      .text("Estrategia de Marketing y Calendario de Contenido", {
        align: "center",
        underline: true,
      });
    doc.moveDown();
    doc
      .fontSize(16)
      .text(`Negocio: ${leadData.negocio || "—"}`, { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(14)
      .text(`Giro: ${leadData.giro || "—"}`, { align: "center" });
    doc.moveDown(0.5);
    if (leadData.descripcion) {
      doc
        .fontSize(12)
        .text(`Descripción: ${leadData.descripcion}`, {
          align: "center",
          width: 500,
        });
    }
    doc.moveDown(2);

    // RESUMEN DE LA ESTRATEGIA
    doc
      .fontSize(14)
      .text("Resumen de Estrategia:", { underline: true });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(strategyText, {
        align: "justify",
        lineGap: 4,
      });
    doc.moveDown(2);

    // CALENDARIO DE CONTENIDO
    doc
      .fontSize(14)
      .text("Calendario de Contenido:", { underline: true });
    doc.moveDown();

    // Suponiendo que queremos generar un calendario para 4 semanas
    const weeks = 4;
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    for (let week = 1; week <= weeks; week++) {
      doc.fontSize(12).text(`Semana ${week}:`, { bold: true });
      doc.moveDown(0.5);
      days.forEach((day) => {
        // Aquí puedes personalizar la sugerencia de contenido para cada día
        doc.fontSize(10).text(`${day}: [Plan de contenido sugerido]`, { indent: 20 });
      });
      doc.moveDown(1);
    }

    // PIE DE PÁGINA
    doc.moveDown(2);
    doc
      .fontSize(10)
      .text("Este documento es generado automáticamente. Revise y ajuste la estrategia según sea necesario.", {
        align: "center",
      });

    doc.end();
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", (err) => reject(err));
  });
}
