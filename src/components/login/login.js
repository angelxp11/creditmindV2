import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
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
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Crear timestamp para la fecha específica: 20 de mayo de 2026 a las 12:07:35 a.m. UTC-5
  const createRegistrationTimestamp = () => {
    // Convertir fecha específica a timestamp de Firestore
    // 20 de mayo de 2026, 12:07:35 UTC-5 = 20 de mayo de 2026, 05:07:35 UTC
    const date = new Date("2026-05-20T05:07:35Z");
    return Timestamp.fromDate(date);
  };

  const handleGoogleSignIn = async () => {
  setLoading(true);
  setError("");

  try {
    const provider = new GoogleAuthProvider();

    await signInWithRedirect(auth, provider);

  } catch (err) {
    console.error("Error en login con Google:", err);
    setError(err.message);
    showToast("Error al iniciar sesión con Google", "error");
    setLoading(false);
  }
};

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Verificar si el usuario existe en Firestore
      const userDocRef = doc(db, "usuarios", user.uid);
      const existingDoc = await getDoc(userDocRef);

      // Si no existe, crear el documento
      if (!existingDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp()
        });
      }

      showToast("¡Sesión iniciada correctamente!", "success");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Correo o contraseña incorrectos");
      showToast("Error al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && <Loading message="Iniciando sesión..." />}
      
      <div className="login-card">
        <h1 className="title">CreditMind</h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleEmailPasswordSignIn}>
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label>Contraseña</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="btn-next" disabled={loading}>
            Iniciar sesión
          </button>
        </form>

        <div className="divider">o</div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FaGoogle />
          Continuar con Google
        </button>
      </div>
    </div>
  );
};

export default Login;

