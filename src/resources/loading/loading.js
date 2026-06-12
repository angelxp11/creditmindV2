import React from "react";
import "./loading.css";

const loading = ({ message = "Cargando..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="loader"></div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default loading;