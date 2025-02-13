import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB18swuetTAFQ5Sv4S1EO3R2g7zw-_uRFm",
  authDomain: "citas-65ed7.firebaseapp.com",
  projectId: "citas-65ed7",
  storageBucket: "citas-65ed7.appspot.com",
  messagingSenderId: "275429010330",
  appId: "1:275429010330:web:65abfeecac4eaed8d46823"
};

// Evitar inicializar Firebase más de una vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
