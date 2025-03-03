// firebaseAuthStorage.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Verifica que la variable de entorno esté definida
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida.');
}

// Inicializa Firebase Admin usando las credenciales de la variable de entorno
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  storageBucket: '<TU_BUCKET_FIREBASE>.appspot.com' // Reemplaza con el nombre de tu bucket
});

const bucket = admin.storage().bucket();
const localAuthFolder = '/data'; // Usamos la ruta del volumen persistente

async function downloadAuthState() {
  if (!fs.existsSync(localAuthFolder)) {
    fs.mkdirSync(localAuthFolder, { recursive: true });
  }
  // Listar archivos en Firebase Storage dentro de 'auth_info/'
  const [files] = await bucket.getFiles({ prefix: 'auth_info/' });
  for (const file of files) {
    const filename = path.basename(file.name);
    const localPath = path.join(localAuthFolder, filename);
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
      metadata: { cacheControl: 'no-cache' }
    });
    console.log(`Subido ${filename} a Firebase Storage`);
  } catch (err) {
    console.error(`Error subiendo ${filename}:`, err);
  }
}

module.exports = { downloadAuthState, uploadAuthFile, localAuthFolder };
