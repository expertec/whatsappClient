// whatsappService.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const Pino = require('pino');
const path = require('path');
const fs = require('fs');

let latestQR = null;
let connectionStatus = "Desconectado";
let whatsappSock = null;

// Ajusta la ruta al volumen persistente en Railway
const localAuthFolder = '/data';

async function connectToWhatsApp() {
  if (!fs.existsSync(localAuthFolder)) {
    fs.mkdirSync(localAuthFolder, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(localAuthFolder);

  try {
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      logger: Pino({ level: 'info' }),
      printQRInTerminal: true,
      version,
    });

    whatsappSock = sock;

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        latestQR = qr;
        connectionStatus = "QR disponible. Escanéalo.";
        QRCode.generate(qr, { small: true });
        console.log('QR generado, escanéalo.');
      }
      if (connection === 'open') {
        connectionStatus = "Conectado";
        latestQR = null;
        console.log('Conexión exitosa con WhatsApp!');
      }
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        connectionStatus = "Desconectado";
        console.log('Conexión cerrada. Razón:', reason);
        if (reason !== DisconnectReason.loggedOut) {
          // Reconectar si no fue un logout
          connectToWhatsApp();
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
  } catch (error) {
    console.error('Error al conectar con WhatsApp:', error);
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
