// scheduler.js
const cron = require('node-cron');
const { db } = require('./firebaseAdmin');
const { getWhatsAppSock } = require('./whatsappService');

// Reemplaza placeholders tipo {{campo}} con datos del lead
function replacePlaceholders(template, leadData) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
    return leadData[fieldName] || match;
  });
}

// Enviar mensaje según el tipo
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

    // Reemplazar placeholders
    const contenidoFinal = replacePlaceholders(mensaje.contenido, lead);

    if (mensaje.type === "texto") {
      // Texto
      await sock.sendMessage(jid, { text: contenidoFinal });
    } else if (mensaje.type === "audio") {
      // Audio con waveform => OGG/Opus + ptt: true
      const audioMessage = {
        audio: { url: contenidoFinal },
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      };
      await sock.sendMessage(jid, audioMessage);
    }
    // Agregar más tipos: imagen, archivo, etc.

    console.log(`Mensaje de tipo "${mensaje.type}" enviado a ${lead.telefono}`);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
}

// Procesar las secuencias activas
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

        // Si ya no hay mensajes pendientes
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

      // Quitar secuencias finalizadas
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

// Ejecutar cada minuto
cron.schedule('* * * * *', () => {
  processSequences();
});
