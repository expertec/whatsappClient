// server/utils/pdfKitGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Crea un PDF con la estrategia generada por ChatGPT, usando pdfkit.
 *
 * @param {string} strategyText - Texto de la estrategia generada.
 * @param {object} lead - Objeto lead (ej: { id, nombre, negocio, giro, etc. })
 * @returns {Promise<string>} - Retorna la ruta local del PDF generado.
 */
async function createStrategyPDF(strategyText, lead) {
  return new Promise((resolve, reject) => {
    // Nombre del archivo
    const fileName = `estrategia-${lead.id || Date.now()}.pdf`;
    // Ruta temporal (en Render se suele usar /tmp)
    const outputPath = path.join('/tmp', fileName);

    // Crear el documento PDF
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Ejemplo de contenido:
    doc.fontSize(16).text(`Estrategia de Marketing para ${lead.negocio}`, {
      underline: true
    });
    doc.moveDown();
    doc.fontSize(12).text(`Giro del negocio: ${lead.giro}`);
    doc.moveDown();
    doc.fontSize(12).text("A continuación se presenta la estrategia generada por ChatGPT:");
    doc.moveDown();
    doc.fontSize(12).text(strategyText, { align: "justify" });

    // Finalizar el PDF
    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', (err) => reject(err));
  });
}

module.exports = { createStrategyPDF };
