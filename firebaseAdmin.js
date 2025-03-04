// firebaseAdmin.js
const admin = require('firebase-admin');

const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!base64Key) {
  throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida.');
}

const serviceAccountJSON = Buffer.from(base64Key, 'base64').toString('utf8');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(serviceAccountJSON)),
  storageBucket: 'app-invita.firebasestorage.app'
});

const db = admin.firestore();

module.exports = { admin, db };
