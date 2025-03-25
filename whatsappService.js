// whatsappService.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const Pino = require('pino');
const path = require('path');
const fs = require('fs');
const { db } = require('./firebaseAdmin'); // Aseguramos tener acceso a Firestore

let latestQR = null;
let connectionStatus = "Desconectado";
let whatsappSock = null;

const localAuthFolder = '/var/data';

async function connectToWhatsApp() {
  try {
    console.log("Verificando carpeta de autenticación en:", localAuthFolder);
    if (!fs.existsSync(localAuthFolder)) {
      fs.mkdirSync(localAuthFolder, { recursive: true });
      console.log("Carpeta creada:", localAuthFolder);
    } else {
      console.log("Carpeta de autenticación existente:", localAuthFolder);
    }

    console.log("Obteniendo estado de autenticación...");
    const { state, saveCreds } = await useMultiFileAuthState(localAuthFolder);

    console.log("Obteniendo la última versión de Baileys...");
    const { version } = await fetchLatestBaileysVersion();
    console.log("Versión obtenida:", version);

    console.log("Intentando conectar con WhatsApp...");
    const sock = makeWASocket({
      auth: state,
      logger: Pino({ level: 'info' }),
      printQRInTerminal: true,
      version
    });

    whatsappSock = sock;

    sock.ev.on('connection.update', (update) => {
      console.log("connection.update:", update);
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        latestQR = qr;
        connectionStatus = "QR disponible. Escanéalo.";
        QRCode.generate(qr, { small: true });
        console.log("QR generado, escanéalo.");
      }
      if (connection === 'open') {
        connectionStatus = "Conectado";
        latestQR = null;
        console.log("Conexión exitosa con WhatsApp!");
      }
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        connectionStatus = "Desconectado";
        console.log("Conexión cerrada. Razón:", reason);
        if (reason !== DisconnectReason.loggedOut) {
          console.log("Intentando reconectar con WhatsApp...");
          connectToWhatsApp();
        }
      }
    });

    sock.ev.on('creds.update', (creds) => {
      console.log("Credenciales actualizadas:", creds);
      saveCreds();
    });

    // Nuevo: Manejar mensajes entrantes para registrar leads automáticamente
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const message of messages) {
        try {
          // Extraemos el número de teléfono del remitente
          const senderJid = message.key.remoteJid;
          const phone = senderJid.split('@')[0];
          // Utiliza el pushName o, en su defecto, el número como nombre
          const name = message.pushName || phone;
          
          // Verificamos si ya existe un lead con este teléfono
          const leadsSnapshot = await db.collection('leads').where('telefono', '==', phone).get();
          if (leadsSnapshot.empty) {
            // Si no existe, creamos un nuevo lead con la etiqueta y secuencia activa por defecto
            const newLead = {
              nombre: name,
              telefono: phone,
              estado: 'nuevo',
              fecha_creacion: new Date(),
              etiquetas: ['nuevoLead'],
              secuenciasActivas: [{
                trigger: 'nuevoLead',
                startTime: new Date().toISOString(),
                index: 0
              }]
            };
            await db.collection('leads').add(newLead);
            console.log(`Nuevo lead creado: ${name} (${phone}) con etiqueta "nuevoLead"`);
          } else {
            console.log(`El lead con teléfono ${phone} ya existe.`);
          }
        } catch (err) {
          console.error("Error procesando mensaje entrante:", err);
        }
      }
    });

    console.log("Conexión de WhatsApp establecida, retornando socket.");
    return sock;
  } catch (error) {
    console.error("Error al conectar con WhatsApp:", error);
    throw error;
  }
}

function getLatestQR() {
  return latestQR;
}

function getConnectionStatus() {
  return connectionStatus;
}

function getWhatsAppSock() {
  return whatsappSock;
}

module.exports = { connectToWhatsApp, getLatestQR, getConnectionStatus, getWhatsAppSock };
