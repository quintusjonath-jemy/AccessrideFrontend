import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase Configuration for AccessRide (Project: accessride-49d15)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAXGzny1PbIlAzKeCs9AhSA81AzskEjTRk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "accessride-49d15.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "accessride-49d15",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "accessride-49d15.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "674130321132",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:674130321132:web:25df7bf2e833400e6d4fc9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
