import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./resources/colors/dark.css";
import "./resources/colors/light.css";
import App from "./App";

const savedTheme = localStorage.getItem("theme") || "system";

const systemTheme = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches
  ? "dark"
  : "light";

const finalTheme =
  savedTheme === "system"
    ? systemTheme
    : savedTheme;

document.body.classList.add(`${finalTheme}-theme`);

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);