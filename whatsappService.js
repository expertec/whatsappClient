// whatsappService.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const Pino = require('pino');

let latestQR = null;
let connectionStatus = "Desconectado";
let whatsappSock = null; // Variable para guardar la conexión

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  try {
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      logger: Pino({ level: 'info' }),
      printQRInTerminal: true,
      version,
    });

    // Guarda la conexión globalmente
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
          connectToWhatsApp();
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', (msg) => {
      console.log('Mensaje recibido:', JSON.stringify(msg, null, 2));
    });

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

// Función para obtener la conexión activa
function getWhatsAppSock() {
  return whatsappSock;
}

module.exports = { connectToWhatsApp, getLatestQR, getConnectionStatus, getWhatsAppSock };
