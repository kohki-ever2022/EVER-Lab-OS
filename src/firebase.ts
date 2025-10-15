import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

// Your web app's Firebase configuration
// These variables are expected to be set in your .env file
// as VITE_FIREBASE_API_KEY=...
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if essential config values are present
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

let app;
let db: Firestore | undefined;
let functions: Functions | undefined;

// Initialize Firebase only if config is valid and it hasn't been initialized
if (isConfigValid) {
    try {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        db = getFirestore(app);
        functions = getFunctions(app);
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase configuration is missing or incomplete. Firebase services will be disabled.");
}


// You can export the app instance if it's needed elsewhere,
// but for services like getFunctions(), getFirestore(), etc.,
// just initializing is often enough.
export { app, db, functions };