// firebaseAuthStorage.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializa Firebase Admin con tu servicio
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')), // Ruta a tu clave JSON
  storageBucket: 'gs://app-invita.firebasestorage.app' // Reemplaza con tu bucket
});

const bucket = admin.storage().bucket();
const localAuthFolder = path.join(__dirname, 'auth_info');

async function downloadAuthState() {
  if (!fs.existsSync(localAuthFolder)) {
    fs.mkdirSync(localAuthFolder);
  }
  // Listar archivos en Firebase Storage dentro de la carpeta "auth_info/"
  const [files] = await bucket.getFiles({ prefix: 'auth_info/' });
  for (const file of files) {
    // Extraer el nombre del archivo sin la carpeta
    const filename = path.basename(file.name);
    const localPath = path.join(localAuthFolder, filename);
    // Descargar solo si el archivo existe en Storage
    try {
      await file.download({ destination: localPath });
      console.log(`Descargado ${filename}`);
    } catch (err) {
      console.error(`Error descargando ${filename}:`, err);
    }
  }
}

async function uploadAuthFile(filename) {
  const localPath = path.join(localAuthFolder, filename);
  const destination = `auth_info/${filename}`;
  try {
    await bucket.upload(localPath, {
      destination,
      metadata: {
        cacheControl: 'no-cache',
      },
    });
    console.log(`Subido ${filename} a Firebase Storage`);
  } catch (err) {
    console.error(`Error subiendo ${filename}:`, err);
  }
}

module.exports = { downloadAuthState, uploadAuthFile, localAuthFolder };
