const admin = require('firebase-admin');

// Serverless-friendly Firebase initialization
let serviceAccount;
try {
  // Only use environment variables for Vercel deployment
  serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL
  };

  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Missing required Firebase credentials in environment variables');
  }
} catch (error) {
  console.error('Error preparing Firebase credentials:', error);
  // Don't exit process in serverless environment
  serviceAccount = null;
}

// Only initialize if we have valid credentials
let db;
if (serviceAccount) {
  try {
    // Check if app is already initialized to prevent duplicate initialization
    let firebaseApp;
    try {
      firebaseApp = admin.app();
    } catch (e) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    db = admin.firestore();
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    db = null;
  }
} else {
  console.error('Firebase initialization skipped due to missing credentials');
}

module.exports = { admin, db }; 