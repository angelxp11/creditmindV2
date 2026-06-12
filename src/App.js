import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "./server/api";

import Login from "./components/login/login";
import Home from "./components/home/home";
import PQR from "./components/pqr/pqr";
import Cuentas from "./components/cuentas/cuentas";
import Deudas from "./components/deudas/deudas";
import Movimientos from "./components/movimientos/movimientos";
import VerMovimientos from "./components/movimientos/vermovimientos/vermovimientos";
import Ingresos from "./components/movimientos/ingresos/ingresos";

import Loading from "./resources/loading/loading";
import ToastContainer from "./resources/toastcontainer/ToastContainer";
import Navbar from "./resources/navbar/navbar";
import ConfirmModal from "./resources/modalquestion/modalquestion";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authDebug, setAuthDebug] = useState("INICIANDO");

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCuentas, setShowCuentas] = useState(false);
  const [showDeudas, setShowDeudas] = useState(false);
  const [showMovimientos, setShowMovimientos] = useState(false);
  const [showVerMovimientos, setShowVerMovimientos] = useState(false);
  const [showIngresos, setShowIngresos] = useState(false);

  const [modalData, setModalData] = useState({
    title: "",
    question: "",
  });

  useEffect(() => {
    console.log("App montada");
    console.log("🔍 Verificando sesión guardada...");

    // Variable para rastrear si el callback fue llamado
    let authCheckCompleted = false;
    let timeoutId = null;

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        authCheckCompleted = true;
        
        console.log("✅ onAuthStateChanged callback ejecutado");
        console.log("CURRENT USER:", auth.currentUser);
        
        // Debug: mostrar localStorage items
        console.log("LOCAL STORAGE ITEMS:", localStorage.length);
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          console.log(`  [${key}]:`, value ? value.substring(0, 50) + "..." : "empty");
        }

        // Debug: mostrar IndexedDB info
        if (indexedDB) {
          indexedDB.databases().then((dbs) => {
            console.log("📦 IndexedDB databases:", dbs.map(db => db.name));
          });
        }

        console.log("onAuthStateChanged =>", currentUser);

        if (currentUser) {
          setAuthDebug(
            `✅ LOGUEADO | ${currentUser.email} | UID: ${currentUser.uid}`
          );
          console.log("🟢 Usuario autenticado:", currentUser.email);
        } else {
          setAuthDebug("⚠️ SIN SESION");
          console.log("🔴 No hay usuario autenticado");
        }

        setUser(currentUser);
        setCheckingAuth(false);
        
        // Limpiar timeout si existe
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      },
      (error) => {
        console.error("❌ Error en onAuthStateChanged:", error);
        setAuthDebug(`ERROR: ${error.message}`);
        setCheckingAuth(false);
      }
    );

    // Fallback timeout: si Auth no responde en 3 segundos, continuar de todas formas
    timeoutId = setTimeout(() => {
      if (!authCheckCompleted) {
        console.warn("⚠️ Auth check timeout - continuando sin esperar más");
        setCheckingAuth(false);
      }
    }, 3000);

    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    console.log("USER STATE ACTUALIZADO =>", user);
  }, [user]);

  const handleLogout = async () => {
    try {
      console.log("🔓 Cerrando sesión...");
      await signOut(auth);
      console.log("✅ Sesión cerrada correctamente");
      setShowLogoutModal(false);
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };

  if (checkingAuth) {
    return (
      <>
        <ToastContainer />
        <Loading message="Verificando sesión..." />
      </>
    );
  }

  return (
    <>
      {/* DEBUG PANEL */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: user ? "#22c55e" : "#ef4444",
          color: "#fff",
          zIndex: 999999,
          padding: "8px",
          fontSize: "11px",
          wordBreak: "break-word",
          fontFamily: "monospace",
        }}
      >
        <strong>STATUS:</strong> {authDebug}
        <br />
        <strong>auth.currentUser:</strong> {auth.currentUser ? auth.currentUser.email : "NULL"}
        <br />
        <strong>RENDER:</strong> {user ? "🟢 HOME" : "🔴 LOGIN"}
      </div>

      <ToastContainer />

      {user ? (
        <>
          <Navbar
            onLogout={(data) => {
              setModalData(data);
              setShowLogoutModal(true);
            }}
            onOpenCuentas={() => {
              setShowCuentas(true);
              setShowDeudas(false);
              setShowMovimientos(false);
              setShowVerMovimientos(false);
              setShowIngresos(false);
            }}
            onOpenDeudas={() => {
              setShowDeudas(true);
              setShowCuentas(false);
              setShowMovimientos(false);
              setShowVerMovimientos(false);
              setShowIngresos(false);
            }}
            onOpenMovimientos={() => {
              setShowMovimientos(true);
              setShowCuentas(false);
              setShowDeudas(false);
              setShowVerMovimientos(false);
              setShowIngresos(false);
            }}
            onOpenIngresos={() => {
              setShowIngresos(true);
              setShowCuentas(false);
              setShowDeudas(false);
              setShowMovimientos(false);
              setShowVerMovimientos(false);
            }}
            onOpenVerMovimientos={() => {
              setShowVerMovimientos(true);
              setShowCuentas(false);
              setShowDeudas(false);
              setShowMovimientos(false);
              setShowIngresos(false);
            }}
            onGoHome={() => {
              setShowCuentas(false);
              setShowDeudas(false);
              setShowMovimientos(false);
              setShowVerMovimientos(false);
              setShowIngresos(false);
            }}
          />

          <Cuentas
            isOpen={showCuentas}
            onClose={() => setShowCuentas(false)}
          />

          <Deudas
            isOpen={showDeudas}
            onClose={() => setShowDeudas(false)}
          />

          <Movimientos
            isOpen={showMovimientos}
            onClose={() => setShowMovimientos(false)}
          />

          <Ingresos
            isOpen={showIngresos}
            onClose={() => setShowIngresos(false)}
          />

          <VerMovimientos
            isOpen={showVerMovimientos}
            onClose={() => setShowVerMovimientos(false)}
          />

          {!showCuentas &&
            !showDeudas &&
            !showMovimientos &&
            !showVerMovimientos && <Home />}

          <PQR />

          <ConfirmModal
            isOpen={showLogoutModal}
            title={modalData.title}
            description={modalData.question}
            confirmText="Cerrar sesión"
            cancelText="Cancelar"
            onConfirm={handleLogout}
            onCancel={() => setShowLogoutModal(false)}
          />
        </>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;