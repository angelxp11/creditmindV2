// adminpr.js
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

import { db, auth } from "../../../server/api";
import "./adminpr.css";

const estadosDisponibles = [
  "Pendiente",
  "En revisión",
  "Respondido",
  "Resuelto",
  "Cerrado",
];

const AdminPR = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);

  // FILTRO INICIAL EN PENDIENTE
  const [filtroEstado, setFiltroEstado] =
    useState("Pendiente");

  useEffect(() => {
    if (!isOpen) return;

    const getSolicitudes = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, "pqr"),
          orderBy("fechaCreacion", "desc")
        );

        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map(
          (docItem) => ({
            id: docItem.id,
            estado:
              docItem.data().estado ||
              "Pendiente",
            observacionTemp: "",
            ...docItem.data(),
          })
        );

        setSolicitudes(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getSolicitudes();
  }, [isOpen]);

  const handleEstadoChange = (
    id,
    value
  ) => {
    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, estado: value }
          : item
      )
    );
  };

  const handleObservacionChange = (
    id,
    value
  ) => {
    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              observacionTemp: value,
            }
          : item
      )
    );
  };

  const handleGuardar = async (item) => {
    try {
      setSavingId(item.id);

      const observacion = {
        estado: item.estado,
        comentario:
          item.observacionTemp ||
          "Sin observación",
        fecha: new Date(),
        admin:
          auth.currentUser?.email ||
          "Administrador",
      };

      const ref = doc(db, "pqr", item.id);

      await updateDoc(ref, {
        estado: item.estado,
        ultimaActualizacion:
          serverTimestamp(),

        historial: arrayUnion(observacion),
      });

      setSolicitudes((prev) =>
        prev.map((sol) =>
          sol.id === item.id
            ? {
                ...sol,
                historial: [
                  ...(sol.historial || []),
                  observacion,
                ],
                observacionTemp: "",
              }
            : sol
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setSavingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="adminpr-overlay"
      onClick={onClose}
    >
      <div
        className="adminpr-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="adminpr-header">
          <h2>Solicitudes PQR</h2>

          <button
            className="adminpr-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* FILTROS */}
        <div className="adminpr-filters">
          {[
            "Pendiente",
            "En revisión",
            "Respondido",
            "Resuelto",
            "Cerrado",
            "Todos",
          ].map((estado) => (
            <button
              key={estado}
              className={`filter-btn ${
                filtroEstado === estado
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFiltroEstado(estado)
              }
            >
              {estado}
            </button>
          ))}
        </div>

        <div className="adminpr-content">
          {loading ? (
            <p className="adminpr-empty">
              Cargando solicitudes...
            </p>
          ) : solicitudes.filter((item) => {
              if (
                filtroEstado === "Todos"
              )
                return true;

              return (
                (item.estado ||
                  "Pendiente") ===
                filtroEstado
              );
            }).length === 0 ? (
            <p className="adminpr-empty">
              No hay solicitudes en este
              estado.
            </p>
          ) : (
            solicitudes
              .filter((item) => {
                if (
                  filtroEstado ===
                  "Todos"
                )
                  return true;

                return (
                  (item.estado ||
                    "Pendiente") ===
                  filtroEstado
                );
              })
              .map((item) => (
                <div
                  className="adminpr-card"
                  key={item.id}
                >
                  <div className="adminpr-top">
                    <span className="adminpr-email">
                      {item.correo}
                    </span>

                    <span className="adminpr-date">
                      {item.fechaCreacion
                        ?.toDate
                        ? item.fechaCreacion
                            .toDate()
                            .toLocaleString()
                        : "Sin fecha"}
                    </span>
                  </div>

                  <p className="adminpr-message">
                    {item.comentario}
                  </p>

                  <div className="adminpr-actions">
                    <div className="adminpr-field">
                      <label>
                        Estado
                      </label>

                      <select
                        value={
                          item.estado
                        }
                        onChange={(e) =>
                          handleEstadoChange(
                            item.id,
                            e.target
                              .value
                          )
                        }
                      >
                        {estadosDisponibles.map(
                          (
                            estado
                          ) => (
                            <option
                              key={
                                estado
                              }
                              value={
                                estado
                              }
                            >
                              {
                                estado
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="adminpr-field">
                      <label>
                        Observación
                      </label>

                      <textarea
                        placeholder="Escribe una observación..."
                        value={
                          item.observacionTemp
                        }
                        onChange={(e) =>
                          handleObservacionChange(
                            item.id,
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <button
                      className="adminpr-save"
                      onClick={() =>
                        handleGuardar(
                          item
                        )
                      }
                      disabled={
                        savingId ===
                        item.id
                      }
                    >
                      {savingId ===
                      item.id
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>
                  </div>

                  <div className="adminpr-history">
                    <h4>
                      Historial
                    </h4>

                    {item.historial &&
                    item.historial
                      .length > 0 ? (
                      item.historial.map(
                        (
                          hist,
                          index
                        ) => (
                          <div
                            className="history-item"
                            key={
                              index
                            }
                          >
                            <span className="history-status">
                              {
                                hist.estado
                              }
                            </span>

                            <p>
                              {
                                hist.comentario
                              }
                            </p>

                            <small>
                              {
                                hist.admin
                              }{" "}
                              •{" "}
                              {hist.fecha
                                ?.toDate
                                ? hist.fecha
                                    .toDate()
                                    .toLocaleString()
                                : new Date(
                                    hist.fecha
                                  ).toLocaleString()}
                            </small>
                          </div>
                        )
                      )
                    ) : (
                      <p className="adminpr-empty-history">
                        No hay
                        historial
                        registrado.
                      </p>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPR;