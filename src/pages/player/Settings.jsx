import React, { useEffect, useState } from "react";
import "./Settings.module.css";


export default function Settings() {
  const [globalTheme, setGlobalTheme] = useState(() => {
    try {
      return localStorage.getItem("pl_theme") || "light";
    } catch {
      return "light";
    }
  });

  // apply theme to <html> (so your .dark selectors in Dashboard.module.css work)
  useEffect(() => {
    try {
      if (globalTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      // ignore
    }
  }, [globalTheme]);

  useEffect(() => {
    // keep component in sync if pl_theme changed in another tab
    const onStorage = (e) => {
      if (e.key === "pl_theme") {
        setGlobalTheme(e.newValue || "light");
      }
    };
    const onCustom = () => {
      try {
        setGlobalTheme(localStorage.getItem("pl_theme") || "light");
      } catch {
        setGlobalTheme("light");
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("pl-theme-change", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pl-theme-change", onCustom);
    };
  }, []);

  const toggleGlobalTheme = () => {
    const next = globalTheme === "dark" ? "light" : "dark";
    setGlobalTheme(next);
    try {
      localStorage.setItem("pl_theme", next);
      // notify same-tab listeners
      window.dispatchEvent(new Event("pl-theme-change"));
    } catch (e) {
      console.warn("Unable to save theme", e);
    }
  };

  return (
    <div className="page page--settings">
      <div className="page-header"></div>

      <div className="settings-grid">
        <section className="card">
          <h3 className="card-title">Umumiy Sozlamalar</h3>

          <div className="form-row">
            <label className="label">Til</label>
            <select className="input select">
              <option value="uz">O'zbek</option>
              <option value="en">English</option>
            </select>

            <label className="label">Valyuta</label>
            <select className="input select">
              <option value="uzs">UZS - O'zbek so'mi</option>
              <option value="usd">USD - Dollar</option>
            </select>
          </div>

          <div className="form-row">
            <label className="label">Vaqt Mintaqasi</label>
            <select className="input select">
              <option>(GMT+5:00) Toshkent</option>
              <option>(GMT+3:00) Moscow</option>
            </select>
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Ko'rinish</h3>
          <div className="form-row theme-row">
            <div className="theme-desc">
              <div className="muted">Mavzu</div>
              <div>Interfeys uchun yorug' yoki qorong'u mavzuni tanlang.</div>
            </div>

            <div className="toggle-wrap">
              {/* global theme toggle */}
              <label
                className="toggle theme-toggle-accessible"
                title="Global theme — barcha player sahifalari"
                aria-label="Global theme toggle"
              >
                <input
                  type="checkbox"
                  checked={globalTheme === "dark"}
                  onChange={toggleGlobalTheme}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </section>

        <section className="card card--full">
          <h3 className="card-title">API Integratsiyasi</h3>
          <p className="muted">
            API kaliti sizga platforma ma'lumotlariga tashqi ilovalar orqali kirish
            imkonini beradi.
          </p>

          <div className="api-row">
            <input
              className="input api-key"
              value="******************************"
              readOnly
            />
            <button className="btn-outline">Kalitni yaratish</button>
          </div>
        </section>

        <section className="card card--full">
          <h3 className="card-title">Offline Rejim</h3>
          <div className="form-row">
            <div>
              <div className="muted small">
                Internet aloqasi bo'lmaganda ma'lumotlarni ko'rish va yuklab olish uchun.
              </div>
            </div>
            <div className="toggle-wrap">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </section>

        <div className="actions">
          <button className="btn-secondary">Bekor qilish</button>
          <button className="btn-primary">O'zgartirishlarni saqlash</button>
        </div>
      </div>
    </div>
  );
}
