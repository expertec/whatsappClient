// whatsappService.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const Pino = require('pino');
const path = require('path');
const fs = require('fs');
const { downloadAuthState, uploadAuthFile } = require('./firebaseAuthStorage');

// En producción usamos el volumen persistente; en desarrollo, una carpeta local
const localAuthFolder = process.env.NODE_ENV === 'production' 
  ? '/data'
  : path.join(__dirname, 'auth_info');

let latestQR = null;
let connectionStatus = "Desconectado";
let whatsappSock = null;
let uploadTimeout = null;

// Función para validar si el archivo de credenciales es válido
function isValidCreds(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    // Considera válido si el objeto tiene contenido (puedes agregar más validaciones si es necesario)
    return json && Object.keys(json).length > 0;
  } catch (err) {
    return false;
  }
}

async function connectToWhatsApp() {
  // Descarga el estado de autenticación desde Firebase Storage
  await downloadAuthState();

  // Asegura que la carpeta de credenciales exista
  if (!fs.existsSync(localAuthFolder)) {
    fs.mkdirSync(localAuthFolder, { recursive: true });
  }

  // Comprueba si existe creds.json y, si existe, que sea válido.
  const credsPath = path.join(localAuthFolder, 'creds.json');
  if (fs.existsSync(credsPath) && !isValidCreds(credsPath)) {
    console.log("Credenciales inválidas detectadas. Eliminando archivo para iniciar sesión fresca.");
    fs.rmSync(credsPath, { force: true });
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
          // Si no fue un logout, intenta reconectar
          connectToWhatsApp();
        }
      }
    });

    // Manejo de creds.update con debounce (60 segundos) para evitar demasiadas escrituras
    sock.ev.on('creds.update', () => {
      if (uploadTimeout) clearTimeout(uploadTimeout);
      uploadTimeout = setTimeout(async () => {
        try {
          if (fs.existsSync(credsPath) && isValidCreds(credsPath)) {
            await uploadAuthFile('creds.json');
            console.log('Credenciales subidas a Firebase Storage');
          } else {
            console.log("No se suben credenciales; archivo no válido o incompleto.");
          }
        } catch (err) {
          console.error("Error subiendo creds.json:", err);
        }
        uploadTimeout = null;
      }, 60000); // 60 segundos de espera
    });

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

function getWhatsAppSock() {
  return whatsappSock;
}

module.exports = { connectToWhatsApp, getLatestQR, getConnectionStatus, getWhatsAppSock };
