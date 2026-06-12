import React from "react";
import "./modalquestion.css";

const modalQuestion = ({
  isOpen,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">{title}</h2>
        <p className="modal-description">{description}</p>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>
            {cancelText}
          </button>

          <button className="modal-btn confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default modalQuestion;