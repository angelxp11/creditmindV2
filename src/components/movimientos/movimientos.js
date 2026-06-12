import React, { useState } from "react";
import { auth, db } from "../../server/api";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import Loading from "../../resources/loading/loading";
import { showToast } from "../../resources/toastcontainer/ToastContainer";
import "./movimientos.css";

const initialForm = {
  valor: "",
  establecimiento: "",
};

const Movimientos = ({ isOpen, onClose }) => {
  const [formValues, setFormValues] = useState(initialForm);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedCuentaId, setSelectedCuentaId] = useState("");

  React.useEffect(() => {
    const fetchAccounts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      try {
        const accountsQuery = query(
          collection(db, "cuentas"),
          where("usuarioId", "==", user.uid)
        );
        const snapshot = await getDocs(accountsQuery);
        const accountDocs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime = a.fechaCreacion?.toMillis ? a.fechaCreacion.toMillis() : 0;
            const bTime = b.fechaCreacion?.toMillis ? b.fechaCreacion.toMillis() : 0;
            return bTime - aTime;
          });
        setAccounts(accountDocs);
      } catch (error) {
        console.error("Error cargando cuentas:", error);
        showToast("No se pudieron cargar las cuentas", "error");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      setFormValues(initialForm);
      setTags([]);
      setTagInput("");
      setSelectedCuentaId("");
      fetchAccounts();
    }
  }, [isOpen]);

  const formatMoneyInput = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Para mostrar saldos — preserva el signo negativo
  const formatMoney = (value) => {
    const num = Number(value);
    const abs = String(Math.abs(num)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return num < 0 ? `-${abs}` : abs;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "valor") {
      setFormValues((prev) => ({
        ...prev,
        valor: value ? formatMoneyInput(value) : "",
      }));
      return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === " " || e.key === "," || e.key === "Enter") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, "");
      if (newTag && !tags.includes(newTag)) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const valor = Number(formValues.valor.replace(/\./g, ""));
    const establecimiento = formValues.establecimiento.trim();
    const fechaHora = new Date();
    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim()]
      : tags;

    const user = auth.currentUser;
    if (!user) { showToast("Necesitas iniciar sesión", "error"); return; }
    if (!selectedCuentaId) { showToast("Selecciona una cuenta para pagar", "error"); return; }
    if (!valor || !establecimiento) { showToast("Completa todos los campos del movimiento", "error"); return; }

    const cuentaSeleccionada = accounts.find((c) => c.id === selectedCuentaId);
    if (!cuentaSeleccionada) { showToast("Cuenta inválida", "error"); return; }
    if (cuentaSeleccionada.saldo < valor) { showToast("Saldo insuficiente en la cuenta seleccionada", "error"); return; }

    setLoading(true);
    try {
      const cuentaRef = doc(db, "cuentas", selectedCuentaId);
      await updateDoc(cuentaRef, {
        saldo: cuentaSeleccionada.saldo - valor,
        ultimaActualizacion: serverTimestamp(),
      });

      await addDoc(collection(db, "movimientos"), {
        userId: user.uid,
        cuentaId: selectedCuentaId,
        cuentaBanco: cuentaSeleccionada.banco,
        cuentaNombre: cuentaSeleccionada.nombre,
        valor,
        establecimiento,
        fechaHora,
        tags: finalTags,
        fechaCreacion: serverTimestamp(),
      });

      showToast("Movimiento registrado correctamente", "success");
      setFormValues(initialForm);
      setTags([]);
      setTagInput("");
      setSelectedCuentaId("");
      // Mantener modal abierto: no llamar a onClose()
    } catch (error) {
      console.error("Error guardando movimiento:", error);
      showToast("No se pudo crear el movimiento", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mov-page">
      {loading && <Loading message="Registrando pago..." />}
      <div className="mov-panel">

        {/* HEADER */}
        <div className="mov-header">
          <div className="mov-header-text">
            <h2>Registrar pago</h2>
            <p>Llena los datos de la compra y pulsa Pagar.</p>
          </div>
          <button className="mov-close" onClick={onClose}>Cerrar</button>
        </div>

        {/* FORM */}
        <form className="mov-form" onSubmit={handleSubmit}>

          {/* Cuenta */}
          <div className="mov-field">
            <span className="mov-label">Cuenta</span>
            <select
              className="mov-select"
              name="cuentaId"
              value={selectedCuentaId}
              onChange={(e) => setSelectedCuentaId(e.target.value)}
            >
              <option value="">Selecciona una cuenta</option>
              {accounts.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.banco} – {cuenta.nombre} (${formatMoney(cuenta.saldo)})
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div className="mov-field">
            <span className="mov-label">Valor</span>
            <input
              className="mov-input"
              name="valor"
              type="text"
              inputMode="numeric"
              value={formValues.valor}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          {/* Establecimiento */}
          <div className="mov-field mov-field--full">
            <span className="mov-label">Establecimiento</span>
            <input
              className="mov-input"
              name="establecimiento"
              type="text"
              value={formValues.establecimiento}
              onChange={handleChange}
              placeholder="Nombre del comercio"
            />
          </div>

          {/* Tags */}
          <div className="mov-field mov-field--full">
            <span className="mov-label">Tags</span>
            <div
              className="mov-tags-wrapper"
              onClick={(e) => e.currentTarget.querySelector("input").focus()}
            >
              {tags.map((tag, i) => (
                <span key={i} className="mov-tag-chip">
                  {tag}
                  <button
                    type="button"
                    className="mov-tag-chip__remove"
                    onClick={() => removeTag(i)}
                    aria-label={`Eliminar ${tag}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                className="mov-tags-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value.toUpperCase())}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Ej. comida, café… (espacio para agregar)" : ""}
              />
            </div>
          </div>

          <button className="mov-submit" type="submit">
            Pagar
          </button>
        </form>

      </div>
    </div>
  );
};

export default Movimientos;