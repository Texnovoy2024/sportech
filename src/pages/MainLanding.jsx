// src/pages/MainLanding.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function MainLanding() {
  return (
    <div style={{ minHeight: "100vh", padding: 40, background: "linear-gradient(90deg,#f1f7f8, #eef7f8)" }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", gap: 24, alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <h1 style={{ fontSize: 42, margin: "8px 0" }}>Sportek Akademiya</h1>
          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Platformaga xush kelibsiz — ro'yxatdan o'ting yoki tizimga kiring.
          </p>

          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <Link to="/register" style={{
              background: "#0e4ce9", color: "#fff", padding: "10px 14px", borderRadius: 8, textDecoration: "none", fontWeight: 700
            }}>
              Ro'yxatdan o'tish
            </Link>

            <Link to="/login" style={{
              background: "#fff", color: "#0b3be6", padding: "10px 14px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(16,24,40,0.06)", fontWeight: 700
            }}>
              Kirish
            </Link>
          </div>
        </div>

        <div style={{ width: 420, height: 260, borderRadius: 12, background: "#fff", boxShadow: "0 10px 30px rgba(16,24,40,0.06)", padding: 18 }}>
          <h3 style={{ marginTop: 0 }}>Nimaga Sportek?</h3>
          <ul style={{ color: "#6b7280" }}>
            <li>Mashg'ulotlarni rejalashtirish va monitoring</li>
            <li>O'yin va individual statistikani tahlil qilish</li>
            <li>Tibbiy bo'lim bilan integratsiya</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
