const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// 1. Definir la ruta al archivo secreto montado por Render
const firebaseKeyPath = path.join('/etc/secrets', 'serviceAccountKey.json');

// 2. Verificar que el archivo exista
if (!fs.existsSync(firebaseKeyPath)) {
  console.error("No se encontró el archivo de llave de Firebase en /etc/secrets/serviceAccountKey.json");
  process.exit(1);
}

// 3. Leer y parsear el archivo JSON
let firebaseServiceAccount;
try {
  const fileData = fs.readFileSync(firebaseKeyPath, 'utf8');
  firebaseServiceAccount = JSON.parse(fileData);
} catch (error) {
  console.error("Error leyendo o parseando el archivo de llave de Firebase:", error);
  process.exit(1);
}

// 4. Inicializar Firebase Admin con la configuración
const { db } = require('./firebaseAdmin');

// Importa la integración con WhatsApp
const { connectToWhatsApp, getLatestQR, getConnectionStatus, getWhatsAppSock } = require('./whatsappService');

// Importa el scheduler (esto iniciará las tareas programadas)
require('./scheduler');

app.use(cors());
app.use(bodyParser.json());

// Endpoint de depuración
app.get('/api/debug-env', (req, res) => {
  const exists = fs.existsSync(firebaseKeyPath);
  res.json({
    archivoSecreto: exists ? "Archivo de llave de Firebase OK" : "No se encontró el archivo secreto",
    ruta: firebaseKeyPath
  });
});

// Endpoint para recibir leads
app.post('/api/leads', async (req, res) => {
  try {
    const { nombre, negocio, telefono } = req.body;
    if (!nombre || !negocio || !telefono) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }
    const nuevoLead = {
      nombre,
      negocio,
      telefono,
      estado: 'nuevo',
      fecha_creacion: new Date()
    };
    const docRef = await db.collection('leads').add(nuevoLead);
    res.json({ message: 'Lead guardado correctamente', id: docRef.id });
  } catch (error) {
    console.error("Error al guardar el lead:", error);
    res.status(500).json({ error: 'Error interno al guardar el lead.' });
  }
});

// Endpoint para iniciar la conexión manualmente
app.get('/api/whatsapp/connect', async (req, res) => {
  try {
    await connectToWhatsApp();
    res.json({ status: 'Conectado', message: 'Conexión iniciada. Espera el QR si aún no estás conectado.' });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: 'Error al conectar con WhatsApp.' });
  }
});

// Endpoint para consultar el estado actual
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: getConnectionStatus(),
    qr: getLatestQR()
  });
});

// Endpoint para enviar mensaje de texto
app.get('/api/whatsapp/send/text', async (req, res) => {
  let phone = req.query.phone;
  if (!phone) return res.status(400).json({ status: 'error', message: 'Número de teléfono requerido.' });
  if (!phone.startsWith('521')) phone = `521${phone}`;
  const sock = getWhatsAppSock();
  if (!sock) return res.status(500).json({ status: 'error', message: 'No hay conexión activa con WhatsApp.' });
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
  if (!phone.startsWith('521')) phone = `521${phone}`;
  const sock = getWhatsAppSock();
  if (!sock) return res.status(500).json({ status: 'error', message: 'No hay conexión activa con WhatsApp.' });
  try {
    const jid = `${phone}@s.whatsapp.net`;
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/app-invita.firebasestorage.app/o/pruebas%2FAnuncio%20Cantalab%20(1).png?alt=media&token=aca28f7b-edbc-473d-b4d5-29e05c8bc42e';
    const message = { image: { url: imageUrl }, caption: 'Mensaje de imagen de prueba desde Firebase' };
    await sock.sendMessage(jid, message);
    res.json({ status: 'ok', message: 'Mensaje de imagen enviado.' });
  } catch (error) {
    console.error('Error enviando mensaje de imagen:', error);
    res.status(500).json({ status: 'error', message: 'Error al enviar mensaje de imagen.' });
  }
});

// Endpoint para enviar mensaje de audio con URL de Firebase
app.get('/api/whatsapp/send/audio', async (req, res) => {
  let phone = req.query.phone;
  if (!phone) return res.status(400).json({ status: 'error', message: 'Número de teléfono requerido.' });
  if (!phone.startsWith('521')) phone = `521${phone}`;
  const sock = getWhatsAppSock();
  if (!sock) return res.status(500).json({ status: 'error', message: 'No hay conexión activa con WhatsApp.' });
  const jid = `${phone}@s.whatsapp.net`;
  const audioUrl = 'https://firebasestorage.googleapis.com/v0/b/app-invita.firebasestorage.app/o/pruebas%2Faudio-ejemplo-CL.mp3?alt=media&token=084ce466-35d9-45cb-a59b-844e86087bac';
  try {
    // Se intenta enviar con ptt: true
    const message = { 
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      ptt: true
    };
    await sock.sendMessage(jid, message);
    res.json({ status: 'ok', message: 'Mensaje de audio enviado con ptt: true.' });
  } catch (error) {
    console.error('Error enviando mensaje de audio con ptt: true:', error);
    try {
      // Se reintenta con ptt: false
      const message = { 
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        ptt: false
      };
      await sock.sendMessage(jid, message);
      res.json({ status: 'ok', message: 'Mensaje de audio enviado con ptt: false.' });
    } catch (error2) {
      console.error('Error enviando mensaje de audio con ptt: false:', error2);
      res.status(500).json({ status: 'error', message: 'Error al enviar mensaje de audio.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
