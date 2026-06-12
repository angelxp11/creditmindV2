import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";

import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";

import { auth, db } from "../../server/api";
import { showToast } from "../../resources/toastcontainer/ToastContainer";
import Loading from "../../resources/loading/loading";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import "./login.css";

const provider = new GoogleAuthProvider();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Completa todos los campos", "error");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      showToast("Inicio de sesión exitoso", "success");
    } catch (error) {
      console.error(error);
      showToast(error.code || "Error al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          nombreCompleto: user.displayName || "",
          correo: user.email || "",
          fechaRegistro: serverTimestamp()
        });
      }

      showToast("Sesión iniciada con Google", "success");
    } catch (error) {
      console.error(error);

      showToast(
        error.code || error.message || "Error al iniciar con Google",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <Loading message="Verificando credenciales..." />
      )}

      <div className="login-container">
        <div className="login-card">
          <h1 className="title">Iniciar Sesión</h1>

          <form onSubmit={handleEmailLogin}>
            <label>Correo electrónico</label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <label>Contraseña</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              className="btn-next"
              type="submit"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="divider">o</div>

          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FaGoogle />
            Continuar con Google
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;