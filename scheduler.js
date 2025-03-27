const axios = require('axios'); // Asegúrate de tener axios disponible
const cron = require('node-cron');
const { db } = require('./firebaseAdmin');
const { getWhatsAppSock } = require('./whatsappService');

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

    // Reemplazar placeholders en el contenido
    const contenidoFinal = replacePlaceholders(mensaje.contenido, lead);
    
    // Validar que el URL no esté vacío para audio e imagen
    if ((mensaje.type === "audio" || mensaje.type === "imagen") && (!contenidoFinal || contenidoFinal.trim() === "")) {
      console.error(`Error: El contenido para ${mensaje.type} está vacío para lead ${lead.id}`);
      return;
    }

    if (mensaje.type === "texto") {
      await sock.sendMessage(jid, { text: contenidoFinal });
    } else if (mensaje.type === "audio") {
      // Descargar el archivo de audio y enviarlo como buffer
      try {
        console.log(`Descargando audio desde: ${contenidoFinal} para el lead ${lead.id}`);
        const response = await axios.get(contenidoFinal, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data, 'binary');
        console.log(`Audio descargado. Tamaño: ${audioBuffer.length} bytes para el lead ${lead.id}`);
        const audioMsg = {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: true
        };
        await sock.sendMessage(jid, audioMsg, { uploadWithoutThumbnail: true });
      } catch (err) {
        console.error("Error al descargar o enviar audio:", err);
      }
    } else if (mensaje.type === "imagen") {
      await sock.sendMessage(jid, { image: { url: contenidoFinal } });
    }
    // Agregar más tipos si se requiere

    console.log(`Mensaje de tipo "${mensaje.type}" enviado a ${lead.telefono}`);
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
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

// Ejecutar cada minuto
cron.schedule('* * * * *', () => {
  processSequences();
});
