// firebaseAdmin.js
const admin = require('firebase-admin');

/**
 * Este módulo exporta una función que recibe un objeto JSON 
 * con las credenciales de Firebase, y luego inicializa Firebase Admin.
 * 
 * @param {Object} firebaseConfig - Objeto JSON con las llaves de servicio.
 * @returns {Object} Retorna un objeto con { admin, db }.
 */
module.exports = function(firebaseConfig) {
  if (!firebaseConfig) {
    throw new Error('No se recibió configuración de Firebase.');
  }

  // Inicializa Firebase Admin con las credenciales y el bucket de Storage
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: 'app-invita.firebasestorage.app'
  });

  // Obtén la instancia de Firestore
  const db = admin.firestore();

  return { admin, db };
};
