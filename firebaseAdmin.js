// firebaseAdmin.js
const admin = require('firebase-admin');

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT no está definida.');
}

// Inicializa Firebase Admin usando las credenciales de la variable de entorno
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  // Reemplaza <YOUR_FIREBASE_BUCKET> por el nombre de tu bucket en Firebase Storage, si lo necesitas
  storageBucket: 'app-invita.firebasestorage.app'
});

// Obtén una instancia de Firestore
const db = admin.firestore();

module.exports = { admin, db };
