import React from "react";
import { auth } from "../../server/api";
import "./home.css";

const Home = () => {
  const user = auth.currentUser;

  // Obtener solo el primer nombre
  const firstName = user?.displayName
    ? user.displayName.split(" ")[0]
    : "Usuario";

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">
          Hola {firstName} 👋
        </h1>

        <p className="home-subtitle">
          Bienvenido a CreditMind
        </p>
      </div>
    </div>
  );
};

export default Home;