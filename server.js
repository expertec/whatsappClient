// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
const { connectToWhatsApp, getLatestQR, getConnectionStatus, getWhatsAppSock } = require('./whatsappService');

app.use(cors());

// Conectar automáticamente al arrancar el servidor
connectToWhatsApp()
  .then(() => console.log("Conexión a WhatsApp iniciada automáticamente"))
  .catch((error) => console.error("Error iniciando conexión a WhatsApp:", error));

// Endpoint para iniciar la conexión manualmente (por si se requiere)
app.get('/api/whatsapp/connect', async (req, res) => {
  try {
    await connectToWhatsApp();
    res.json({ status: 'Conectado', message: 'Conexión iniciada. Espera el QR si aún no estás conectado.' });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: 'Error al conectar con WhatsApp.' });
  }
});

// Endpoint para consultar el estado actual (QR y conexión)
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: getConnectionStatus(),
    qr: getLatestQR()
  });
});

// Endpoint para enviar mensaje de texto
app.get('/api/whatsapp/send/text', async (req, res) => {
  let phone = req.query.phone;
  if (!phone) {
    return res.status(400).json({ status: 'error', message: 'Número de teléfono requerido.' });
  }
  
  // Si el número no comienza con "521", lo concatenamos
  if (!phone.startsWith('521')) {
    phone = `521${phone}`;
  }
  
  const sock = getWhatsAppSock();
  if (!sock) {
    return res.status(500).json({ status: 'error', message: 'No hay conexión activa con WhatsApp.' });
  }
  
  try {
    const jid = `${phone}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: 'Mensaje de prueba desde WhatsApp API' });
    res.json({ status: 'ok', message: 'Mensaje de texto enviado.' });
  } catch (error) {
    console.error('Error enviando mensaje de texto:', error);
    res.status(500).json({ status: 'error', message: 'Error al enviar mensaje de texto.' });
  }
});

// Endpoint para enviar mensaje de imagen con URL de Firebase
app.get('/api/whatsapp/send/image', async (req, res) => {
  let phone = req.query.phone;
  if (!phone) return res.status(400).json({ status: 'error', message: 'Número de teléfono requerido.' });
  
  if (!phone.startsWith('521')) {
    phone = `521${phone}`;
  }
  
  const sock = getWhatsAppSock();
  if (!sock) {
    return res.status(500).json({ status: 'error', message: 'No hay conexión activa con WhatsApp.' });
  }
  
  try {
    const jid = `${phone}@s.whatsapp.net`;
    // URL de la imagen en Firebase
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/app-invita.firebasestorage.app/o/pruebas%2FAnuncio%20Cantalab%20(1).png?alt=media&token=aca28f7b-edbc-473d-b4d5-29e05c8bc42e';
    const message = { image: { url: imageUrl }, caption: 'Mensaje de imagen de prueba desde Firebase' };
    await sock.sendMessage(jid, message);
    res.json({ status: 'ok', message: 'Mensaje de imagen enviado.' });
  } catch (error) {
    console.error('Error enviando mensaje de imagen:', error);
    res.status(500).json({ status: 'error', message: 'Error al enviar mensaje de imagen.' });
  }
});

// Endpoint para enviar mensaje de audio con URL de Firebase y wave form (ptt)
app.get('/api/whatsapp/send/audio', async (req, res) => {
  let phone = req.query.phone;
  if (!phone) return res.status(400).json({ status: 'error', message: 'Número de teléfono requerido.' });
  
  if (!phone.startsWith('521')) {
    phone = `521${phone}`;
  }
  
  const sock = getWhatsAppSock();
  if (!sock) {
    return res.status(500).json({ status: 'error', message: 'No hay conexión activa con WhatsApp.' });
  }
  
  try {
    const jid = `${phone}@s.whatsapp.net`;
    // URL del audio en Firebase
    const audioUrl = 'https://firebasestorage.googleapis.com/v0/b/app-invita.firebasestorage.app/o/pruebas%2Faudio-ejemplo-CL.mp3?alt=media&token=084ce466-35d9-45cb-a59b-844e86087bac';
    // Agregamos ptt: true para que se muestre como audio de voz (con wave form)
    const message = { 
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      ptt: true
    };
    await sock.sendMessage(jid, message);
    res.json({ status: 'ok', message: 'Mensaje de audio enviado.' });
  } catch (error) {
    console.error('Error enviando mensaje de audio:', error);
    res.status(500).json({ status: 'error', message: 'Error al enviar mensaje de audio.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
