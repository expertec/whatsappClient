// server/utils/pdfKitGenerator.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Crea un PDF con la estrategia de marketing generada.
 * @param {string} strategyText - Texto de la estrategia.
 * @param {object} leadData - Datos del lead (nombre, negocio, giro, etc.)
 * @returns {Promise<string>} - Ruta local del PDF generado.
 */
export async function createStrategyPDF(strategyText, leadData) {
  return new Promise((resolve, reject) => {
    const fileName = `estrategia-${leadData.id || Date.now()}.pdf`;
    // Usamos /tmp como carpeta temporal en Render
    const outputPath = path.join('/tmp', fileName);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Agrega el contenido del PDF
    doc.fontSize(16).text(`Estrategia de Marketing para ${leadData.negocio}`, {
      underline: true
    });
    doc.moveDown();
    doc.fontSize(12).text(`Giro del negocio: ${leadData.giro}`);
    doc.moveDown();
    doc.fontSize(12).text("Estrategia generada:", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(strategyText, { align: "justify" });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', (err) => reject(err));
  });
}
