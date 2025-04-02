import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Crea un PDF utilizando el texto plano generado por ChatGPT para el plan de ventas.
 * Se muestra un encabezado con la información del lead y luego el contenido completo del plan.
 *
 * @param {string} planText - El texto generado por ChatGPT.
 * @param {object} leadData - Datos del lead, por ejemplo:
 *   {
 *     negocio: "SP Playeras",
 *     giro: "Venta de Ropa",
 *     descripcion: "Venta de ropa al mayoreo con énfasis en calidad y moda.",
 *     nombre: "Michel Perez",
 *     telefono: "8311760335"
 *   }
 * @returns {Promise<string>} - Ruta local del PDF generado.
 */
export async function createPlanPDF(planText, leadData) {
  return new Promise((resolve, reject) => {
    const fileName = `plan-ventas-${leadData.id || Date.now()}.pdf`;
    const outputPath = path.join('/tmp', fileName);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Encabezado: Datos del negocio
    doc.fontSize(20)
       .text(`Plan de Ventas para Facebook`, { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(14)
       .text(`Negocio: ${leadData.negocio || "N/D"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Sector (Giro): ${leadData.giro || "N/D"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Descripción: ${leadData.descripcion || "N/D"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Contacto: ${leadData.nombre || "N/D"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Teléfono: ${leadData.telefono || "N/D"}`, { align: "center" });
    doc.fontSize(12)
       .text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    // Contenido: El plan generado por ChatGPT
    doc.fontSize(12).text(planText, { align: "justify", lineGap: 4 });

    doc.end();
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", err => reject(err));
  });
}
