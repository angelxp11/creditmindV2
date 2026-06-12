import React, { useEffect, useState } from "react";
import "./theme.css";

const Theme = () => {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "system"
  );

  const applyTheme = (selectedTheme) => {
    const finalTheme =
      selectedTheme === "system"
        ? getSystemTheme()
        : selectedTheme;

    document.body.classList.remove(
      "light-theme",
      "dark-theme"
    );

    document.body.classList.add(
      `${finalTheme}-theme`
    );

    localStorage.setItem("theme", selectedTheme);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme); // aplica al instante
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () =>
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
  }, [theme]);

  return (
    <div className="theme-container">
      <h3>Tema</h3>
      <p>Personaliza la apariencia de CreditMind</p>

      <div className="theme-options">
        <button
          className={theme === "light" ? "active" : ""}
          onClick={() => handleThemeChange("light")}
        >
          ☀️ Claro
        </button>

        <button
          className={theme === "dark" ? "active" : ""}
          onClick={() => handleThemeChange("dark")}
        >
          🌙 Oscuro
        </button>

        <button
          className={theme === "system" ? "active" : ""}
          onClick={() => handleThemeChange("system")}
        >
          💻 Sistema
        </button>
      </div>
    </div>
  );
};

export default Theme;