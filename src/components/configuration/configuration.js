import React from "react";
import { FaPalette, FaTimes } from "react-icons/fa";
import Theme from "./themes/theme";
import "./configuration.css";

const Configuration = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="config-overlay"
      onClick={onClose}
    >
      <div
        className="config-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="config-close"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <div className="config-sidebar">
          <button className="config-option active">
            <FaPalette />
            <span>Tema</span>
          </button>
        </div>

        <div className="config-content">
          <Theme />
        </div>
      </div>
    </div>
  );
};

export default Configuration;