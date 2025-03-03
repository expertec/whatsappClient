// scheduler.js
const cron = require('node-cron');
const { db } = require('./firebaseAdmin');
const { getWhatsAppSock } = require('./whatsappService');

// Función para enviar mensaje de bienvenida
async function enviarMensajeBienvenida(lead) {
  try {
    const sock = getWhatsAppSock();
    if (!sock) {
      console.error("No hay conexión activa con WhatsApp.");
      return;
    }
    // Asegurarse de que el número tenga el prefijo adecuado
    let phone = lead.telefono;
    if (!phone.startsWith('521')) {
      phone = `521${phone}`;
    }
    const jid = `${phone}@s.whatsapp.net`;
    // Enviar mensaje de bienvenida (ajusta el mensaje según lo que necesites)
    await sock.sendMessage(jid, { text: '¡Hola! Gracias por contactarnos. Aquí tienes la información inicial.' });
    console.log(`Mensaje de bienvenida enviado a ${lead.telefono}`);
    // Actualiza el estado del lead para evitar envíos duplicados
    await db.collection('leads').doc(lead.id).update({
      estado: 'mensaje_enviado',
      fecha_mensaje: new Date()
    });
  } catch (error) {
    console.error("Error al enviar mensaje de bienvenida:", error);
  }
}

// Tarea programada: revisar leads nuevos cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log("Revisando leads nuevos...");
  try {
    // Consulta leads con estado 'nuevo'
    const snapshot = await db.collection('leads').where('estado', '==', 'nuevo').get();
    snapshot.forEach(doc => {
      const lead = { id: doc.id, ...doc.data() };
      enviarMensajeBienvenida(lead);
    });
  } catch (error) {
    console.error("Error al revisar leads:", error);
  }
});

module.exports = { enviarMensajeBienvenida };
