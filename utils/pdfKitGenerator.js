import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Crea un PDF utilizando el texto plano generado por ChatGPT para el plan de ventas.
 * Se añade un fondo membretado (solo en la parte superior) usando la imagen proporcionada.
 * El PDF incluye un encabezado con los datos del lead y luego el contenido completo estilizado.
 *
 * @param {string} planText - El plan generado por ChatGPT en formato de texto plano.
 * @param {object} leadData - Datos del lead, por ejemplo:
 *   {
 *     negocio: "Refacciones Rafa",
 *     giro: "Venta de refacciones para autos",
 *     descripcion: "Vendemos refacciones para automóviles con garantía y asesoría personalizada.",
 *     nombre: "Rafa Soto",
 *     telefono: "8311760335"
 *   }
 * @returns {Promise<string>} - Ruta local del PDF generado.
 */
export async function createStrategyPDF(planText, leadData) {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = `plan-ventas-${leadData.id || Date.now()}.pdf`;
      const outputPath = path.join('/tmp', fileName);
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Registrar la fuente "Helvetica" (default en PDFKit, moderna y sans serif)
      doc.font('Helvetica');

      // Descargar y dibujar la imagen de fondo en el encabezado (membrete)
      try {
        const response = await axios.get('https://i.imgur.com/37p6fcV.jpeg', { responseType: 'arraybuffer' });
        const bgBuffer = Buffer.from(response.data, 'binary');
        // Dibujar la imagen en la parte superior (por ejemplo, ocupar 150 puntos de altura)
        doc.image(bgBuffer, 0, 0, { width: doc.page.width, height: 150 });
      } catch (bgError) {
        console.error('Error al cargar la imagen de fondo:', bgError);
      }

      // Dejar un espacio para que se vea el membrete de fondo
      // Establecer la posición de inicio del contenido debajo del header
      doc.moveDown(7); // Aproximadamente 7 líneas (ajusta según tu preferencia)

      // Dibujar una línea divisoria después del encabezado
      doc.lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown();

      // Encabezado de datos del negocio (se sobrepone al fondo, pero está justo debajo del membrete)
      doc.fontSize(16)
         .fillColor('black')
         .text("Plan de Ventas para Facebook", { align: "center", underline: true });
      doc.moveDown(0.5);
      doc.fontSize(14)
         .text(`Negocio: ${leadData.negocio || "N/D"}`, { align: "center" });
      doc.fontSize(12)
         .text(`Giro: ${leadData.giro || "N/D"}`, { align: "center" });
      doc.fontSize(12)
         .text(`Descripción: ${leadData.descripcion || "N/D"}`, { align: "center" });
      doc.fontSize(12)
         .text(`Contacto: ${leadData.nombre || "N/D"}`, { align: "center" });
      doc.fontSize(12)
         .text(`Teléfono: ${leadData.telefono || "N/D"}`, { align: "center" });
      doc.fontSize(12)
         .text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown(2);

      // Dibujar otra línea divisoria antes del contenido principal
      doc.lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown();

      // Contenido del plan (generado por ChatGPT) con estilo y espaciado
      doc.fontSize(12)
         .text(planText, { align: "justify", lineGap: 4 });

      doc.end();
      stream.on("finish", () => resolve(outputPath));
      stream.on("error", err => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
