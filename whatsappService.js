// whatsappService.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const Pino = require('pino');
const path = require('path');
const fs = require('fs');

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

module.exports = {
  connectToWhatsApp,
  getLatestQR,
  getConnectionStatus,
  getWhatsAppSock
};
