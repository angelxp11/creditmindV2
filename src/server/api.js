
// Import Firebase core
import { initializeApp } from "firebase/app";

// Analytics (opcional)
import { getAnalytics } from "firebase/analytics";

// 🔥 AUTH
import { getAuth } from "firebase/auth";

// 🔥 FIRESTORE
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC2FhFI0sXYy-lAC_G42B6Dh6fVh6gfCm8",
  authDomain: "creditmind-8ea8b.firebaseapp.com",
  projectId: "creditmind-8ea8b",
  storageBucket: "creditmind-8ea8b.firebasestorage.app",
  messagingSenderId: "891749664306",
  appId: "1:891749664306:web:2be791460e20429c0a9e2b",
  measurementId: "G-ZTNJ75ZWYN"
};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics (solo funciona en navegador)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Exportar para usar en el proyecto
export { auth, db, analytics };