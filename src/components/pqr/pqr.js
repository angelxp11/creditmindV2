import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../server/api";
import { showToast } from "../../resources/toastcontainer/ToastContainer";
import "./pqr.css";

const PQR = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showToast("Escribe una sugerencia", "error");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      showToast("Debes iniciar sesión", "error");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "pqr"), {
        comentario: message.trim(),
        correo: user.email,
        fechaCreacion: serverTimestamp(),
      });

      showToast("Sugerencia enviada correctamente", "success");
      setMessage("");
    } catch (error) {
      console.error(error);
      showToast("Error al enviar la sugerencia", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="pqr-footer">
      <div className="pqr-container">
        <h3 className="pqr-title">
          Ayúdanos a mejorar
        </h3>

        <p className="pqr-text">
          Déjanos sugerencias, ideas o comentarios
          para futuras mejoras.
        </p>

        <form className="pqr-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Escribe tu sugerencia..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </footer>
  );
};

export default PQR;