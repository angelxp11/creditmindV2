import React, { useEffect, useState } from "react";
import { auth, db } from "../../../server/api";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Loading from "../../../resources/loading/loading";
import { showToast } from "../../../resources/toastcontainer/ToastContainer";
import "./vermovimientos.css";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace(/\./g, "")) || 0;
  return 0;
};

const formatMoney = (value) => {
  const digits = String(getNumber(value)).replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const VerMovimientos = ({ isOpen, onClose }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedCuentaId, setSelectedCuentaId] = useState("");
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  /* Cargar cuentas al abrir */
  useEffect(() => {
    if (!isOpen) return;

    const fetchAccounts = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, "cuentas"), where("usuarioId", "==", user.uid))
        );
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            (b.fechaCreacion?.toMillis?.() ?? 0) - (a.fechaCreacion?.toMillis?.() ?? 0)
          );
        setAccounts(docs);
        setSelectedCuentaId(docs[0]?.id || "");
      } catch {
        showToast("No se pudieron cargar las cuentas", "error");
      } finally {
        setLoading(false);
      }
    };

    setAccounts([]);
    setMovements([]);
    setSelectedCuentaId("");
    fetchAccounts();
  }, [isOpen]);

  /* Cargar movimientos al cambiar cuenta */
  useEffect(() => {
    if (!isOpen || !selectedCuentaId) { setMovements([]); return; }

    const fetchMovements = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setLoading(true);
      try {
        const snap = await getDocs(
          query(
            collection(db, "movimientos"),
            where("usuarioId", "==", user.uid),
            where("cuentaId", "==", selectedCuentaId)
          )
        );
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            (b.fechaCreacion?.toMillis?.() ?? 0) - (a.fechaCreacion?.toMillis?.() ?? 0)
          );
        setMovements(docs);
      } catch {
        showToast("No se pudieron cargar los movimientos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, [isOpen, selectedCuentaId]);

  /* Cálculos resumen */
  const cuentaActual = accounts.find((c) => c.id === selectedCuentaId);
  const totalEgresos = movements.reduce((acc, m) => acc + (m.establecimiento ? getNumber(m.valor) : 0), 0);
  const totalIngresos = movements.reduce((acc, m) => acc + (m.descripcion ? getNumber(m.valor) : 0), 0);
  const cantMovimientos = movements.length;

  if (!isOpen) return null;

  return (
    <div className="ver-page">
      {loading && <Loading message="Cargando movimientos..." />}
      <div className="ver-panel">

          {/* HEADER */}
          <div className="ver-header">
            <div className="ver-header-text">
              <h2>Movimientos de cuenta</h2>
              <p>Selecciona una cuenta para ver su historial.</p>
            </div>
            <button className="ver-close" onClick={onClose}>Cerrar</button>
          </div>

          {/* SELECTOR DE CUENTA */}
          <div className="ver-cuenta-bar">
            <span className="ver-cuenta-label">Cuenta</span>
            <select
              className="ver-select"
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

          {/* TARJETAS RESUMEN */}
          {selectedCuentaId && (
            <div className="ver-summary">
              <div className="ver-summary-card ver-summary-card--accent">
                <span className="ver-summary-card__label">Saldo actual</span>
                <span className="ver-summary-card__value">
                  ${formatMoney(cuentaActual?.saldo ?? 0)}
                </span>
              </div>
              <div className="ver-summary-card ver-summary-card--danger">
                <span className="ver-summary-card__label">Total gastado</span>
                <span className="ver-summary-card__value">
                  ${formatMoney(totalEgresos)}
                </span>
              </div>
              <div className="ver-summary-card">
                <span className="ver-summary-card__label">Movimientos</span>
                <span className="ver-summary-card__value">{cantMovimientos}</span>
              </div>
            </div>
          )}

          {/* LISTA */}
          <div className="ver-list">
            {accounts.length === 0 ? (
              <div className="ver-empty">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="2" y="5" width="20" height="14" rx="3"/>
                  <path d="M2 10h20"/>
                </svg>
                <span>No tienes cuentas registradas.</span>
              </div>
            ) : !selectedCuentaId ? (
              <div className="ver-empty">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span>Selecciona una cuenta para ver los movimientos.</span>
              </div>
            ) : movements.length === 0 ? (
              <div className="ver-empty">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4"/>
                </svg>
                <span>No hay movimientos para esta cuenta.</span>
              </div>
            ) : (
              <table className="ver-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Valor</th>
                    <th>Establecimiento</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                      <tr key={m.id}>
                        <td>{formatDateTime(m.fechaHora)}</td>
                        <td>
                          {m.descripcion ? (
                            <span className="ver-valor ver-valor--ingreso">+${formatMoney(m.valor)}</span>
                          ) : (
                            <span className="ver-valor ver-valor--egreso">−${formatMoney(m.valor)}</span>
                          )}
                        </td>
                        <td>{m.establecimiento || m.descripcion || "-"}</td>
                        <td>
                          {(m.tags || []).map((tag, i) => (
                            <span key={i} className="ver-tag-badge">{tag}</span>
                          ))}
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

      </div>
    </div>
  );
};

export default VerMovimientos;