// src/main.jsx (yoki index.jsx)
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// agar App.jsx ichida BrowserRouter borligini xohlamasangiz - bu yerda qo'yish mumkin
// import { BrowserRouter } from "react-router-dom";

const root = createRoot(document.getElementById("root"));
root.render(
  // agar App ichida BrowserRouter bo'lsa, faqat <App />
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
