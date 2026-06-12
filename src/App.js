import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  getRedirectResult
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

  // Procesa el retorno de signInWithRedirect
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log("REDIRECT OK:", result.user);

        setAuthDebug(
          `REDIRECT OK | ${result.user.email} | UID: ${result.user.uid}`
        );

        setUser(result.user);
        setCheckingAuth(false);
      }
    })
    .catch((error) => {
      console.error("REDIRECT ERROR:", error);

      setAuthDebug(
        `REDIRECT ERROR: ${error.code || error.message}`
      );
    });

  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    console.log("onAuthStateChanged =>", currentUser);

    if (currentUser) {
      setAuthDebug(
        `LOGUEADO | ${currentUser.email} | UID: ${currentUser.uid}`
      );
    } else {
      setAuthDebug("SIN SESION");
    }

    setUser(currentUser);
    setCheckingAuth(false);
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    console.log("USER STATE =>", user);
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
    } catch (error) {
      console.error(error);
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
      {/* DEBUG */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "#ff0000",
          color: "#fff",
          zIndex: 999999,
          padding: "8px",
          fontSize: "11px",
          wordBreak: "break-word",
        }}
      >
        {authDebug}
        <br />
        auth.currentUser:
        {auth.currentUser ? auth.currentUser.email : "NULL"}
        <br />
        render:
        {user ? "HOME" : "LOGIN"}
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