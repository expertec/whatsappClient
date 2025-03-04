// firebaseAdmin.js
const admin = require('firebase-admin');

// Lee la variable de entorno con la clave codificada en Base64
const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!base64Key) {
  throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida.');
}

// Decodifica la cadena Base64 a texto y parsea el JSON resultante
let serviceAccount;
try {
  serviceAccount = JSON.parse(Buffer.from(base64Key, 'base64').toString('utf8'));
} catch (error) {
  throw new Error('Error al parsear el JSON de la variable FIREBASE_SERVICE_ACCOUNT_BASE64: ' + error.message);
}

// Inicializa Firebase Admin con las credenciales y el bucket de Storage
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'app-invita.firebasestorage.app'
});

// Obtén la instancia de Firestore
const db = admin.firestore();

module.exports = { admin, db };
