const axios = require('axios');
const cron = require('node-cron');
const { db } = require('./firebaseAdmin');
const { getWhatsAppSock } = require('./whatsappService');
const fs = require('fs');
const path = require('path');

// Importa funciones para ChatGPT y generación de PDF
const { generarEstrategia } = require('./chatGpt');
const { generateStrategyPDF } = require('./utils/generateStrategyPDF');

// Función para reemplazar placeholders en el mensaje
function replacePlaceholders(template, leadData) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
    return leadData[fieldName] || match;
  });
}

// Función para enviar mensaje según el tipo
async function enviarMensaje(lead, mensaje) {
  try {
    const sock = getWhatsAppSock();
    if (!sock) {
      console.error("No hay conexión activa con WhatsApp.");
      return;
    }
    let phone = lead.telefono;
    if (!phone.startsWith('521')) {
      phone = `521${phone}`;
    }
    const jid = `${phone}@s.whatsapp.net`;
    const contenidoFinal = replacePlaceholders(mensaje.contenido, lead);

    if (mensaje.type === "texto") {
      await sock.sendMessage(jid, { text: contenidoFinal });
    } else if (mensaje.type === "audio") {
      try {
        console.log(`Descargando audio desde: ${contenidoFinal} para el lead ${lead.id}`);
        const response = await axios.get(contenidoFinal, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data, 'binary');
        console.log(`Audio descargado. Tamaño: ${audioBuffer.length} bytes para el lead ${lead.id}`);
        if (audioBuffer.length === 0) {
          console.error(`Error: El archivo descargado está vacío para el lead ${lead.id}`);
          return;
        }
        const audioMsg = {
          audio: audioBuffer,
          mimetype: 'audio/mp4', // o 'audio/m4a'
          fileName: 'output.m4a',
          ptt: true
        };
        await sock.sendMessage(jid, audioMsg);
      } catch (err) {
        console.error("Error al descargar o enviar audio:", err);
      }
    } else if (mensaje.type === "imagen") {
      await sock.sendMessage(jid, { image: { url: contenidoFinal } });
    } else if (mensaje.type === "pdfChatGPT") {
      await procesarMensajePDFChatGPT(lead, mensaje);
    }
    console.log(`Mensaje de tipo "${mensaje.type}" enviado a ${lead.telefono}`);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
}

// Función para procesar el mensaje de tipo "pdfChatGPT"
async function procesarMensajePDFChatGPT(lead, mensaje) {
  try {
    console.log(`Procesando PDF ChatGPT para el lead ${lead.id}`);
    // Llama a ChatGPT para generar el contenido de la estrategia según el giro de negocio
    const strategyText = await generarEstrategia(lead.giro);
    if (!strategyText) {
      console.error("No se pudo generar la estrategia");
      return;
    }
    // Genera el PDF usando el texto generado y los datos del lead
    const pdfFilePath = await generateStrategyPDF(strategyText, lead);
    console.log("PDF generado en:", pdfFilePath);
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    const sock = getWhatsAppSock();
    if (!sock) {
      console.error("No hay conexión activa con WhatsApp.");
      return;
    }
    let phone = lead.telefono;
    if (!phone.startsWith('521')) {
      phone = `521${phone}`;
    }
    const jid = `${phone}@s.whatsapp.net`;
    await sock.sendMessage(jid, {
      document: pdfBuffer,
      fileName: `Estrategia-${lead.nombre}.pdf`,
      mimetype: "application/pdf"
    });
    console.log(`PDF de estrategia enviado a ${lead.telefono}`);
  } catch (err) {
    console.error("Error procesando mensaje pdfChatGPT:", err);
  }
}

// Función principal que procesa las secuencias activas para cada lead
async function processSequences() {
  console.log("Ejecutando scheduler de secuencias...");
  try {
    const leadsSnapshot = await db.collection('leads')
      .where('secuenciasActivas', '!=', null)
      .get();

    leadsSnapshot.forEach(async (docSnap) => {
      const lead = { id: docSnap.id, ...docSnap.data() };
      if (!lead.secuenciasActivas || lead.secuenciasActivas.length === 0) return;
      let actualizaciones = false;
      for (let i = 0; i < lead.secuenciasActivas.length; i++) {
        const seqActiva = lead.secuenciasActivas[i];
        const secSnapshot = await db.collection('secuencias')
          .where('trigger', '==', seqActiva.trigger).get();
        if (secSnapshot.empty) continue;
        const secuencia = secSnapshot.docs[0].data();
        const mensajes = secuencia.messages;
        if (seqActiva.index >= mensajes.length) {
          lead.secuenciasActivas[i] = null;
          actualizaciones = true;
          continue;
        }
        const mensaje = mensajes[seqActiva.index];
        const startTime = new Date(seqActiva.startTime);
        const envioProgramado = new Date(startTime.getTime() + mensaje.delay * 60000);
        if (Date.now() >= envioProgramado.getTime()) {
          await enviarMensaje(lead, mensaje);
          seqActiva.index += 1;
          actualizaciones = true;
        }
      }
      if (actualizaciones) {
        lead.secuenciasActivas = lead.secuenciasActivas.filter(item => item !== null);
        await db.collection('leads').doc(lead.id).update({
          secuenciasActivas: lead.secuenciasActivas
        });
      }
    });
  } catch (error) {
    console.error("Error en processSequences:", error);
  }
}

// Ejecutar el scheduler cada minuto
cron.schedule('* * * * *', () => {
  processSequences();
});
