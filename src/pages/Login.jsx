import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider"; // changed to useAuth hook
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const preRole = location.state?.preRole || null; // from register
  const { login, user: authUser } = useAuth(); // use AuthProvider's login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

 const submit = async (e) => {
  e.preventDefault();
  setErr("");
  setLoading(true);
  try {
    const res = await login({ email, password }); // AuthProvider.login
    console.log("[Login] login result:", res);

    // prefer res.user, fallback localStorage
    let user = res?.user || null;
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem("app_user") || "null");
      } catch (err) {
        console.warn("parse app_user failed", err);
      }
    }

    console.log("[Login] effective user:", user, "preRole:", preRole);

    if (!user) throw new Error("Foydalanuvchi topilmadi");

    // 🔹 Role bo'yicha redirect:
    if (user.role === "player") {
      navigate("/player", { replace: true });
      return;
    }

    if (user.role === "coach") {
      navigate("/coach", { replace: true });
      return;
    }

    // Keyinchalik boshqa rollar uchun ham shu yerga qo'shvorasan:
    // if (user.role === "headcoach") { ... }
    // if (user.role === "admin") { ... } va hokazo

    // Agar role notanish bo'lsa:
    if (user.role) {
      alert(`Sizning rol '${user.role}' — bu hudud uchun kirish yo'q.`);
      navigate("/", { replace: true });
      return;
    }

    // agar umuman role bo'lmasa:
    navigate("/", { replace: true });
  } catch (err) {
    console.error(err);
    setErr(err.message || "Login xatosi");
  } finally {
    setLoading(false);
  }
};




  // ... styles and JSX remain unchanged (I left them intact below)
  // STYLES (copied from your original file)
  const pageStyle = {
    minHeight: "100vh",
    padding: "36px 12px",
    background: "linear-gradient(90deg,#f1f7f8, #eef7f8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const card = {
    width: 540,
    maxWidth: "calc(100% - 32px)",
    padding: 30,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(16,24,40,0.06)",
    textAlign: "center",
    minHeight: 460,
  };

  const logoStyle = {
    width: 56,
    height: 56,
    objectFit: "contain",
    display: "block",
    margin: "0 auto 8px",
  };

  const title = { margin: 0, fontSize: 22, fontWeight: 900, lineHeight: 1.05 };
  const subtitle = { marginTop: 6, marginBottom: 18, color: "#6b7280", fontSize: 14 };
  const fieldLabel = { display: "block", textAlign: "left", marginBottom: 6, fontSize: 14, color: "#374151" };
  const inputWrap = { position: "relative", marginBottom: 12, textAlign: "left" };
  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e6e9ee",
    background: "#fff",
    fontSize: 15,
    boxSizing: "border-box",
  };
  const checkboxRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 };
  const btn = {
    marginTop: 16,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#1967FF",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(25,103,255,0.18)",
  };
  const footer = { marginTop: 12, fontSize: 14, color: "#374151" };

  return (
    <div style={pageStyle} className="auth-page">
      <div style={card} className="auth-card">
        <img src="/src/assets/logo1.png" alt="logo" style={logoStyle} />
        <h1 style={title}>Hisobingizga kiring</h1>
        <div style={subtitle}>Platformamizga kirish uchun login va parolni kiriting.</div>

        <form onSubmit={submit} style={{ marginTop: 6, textAlign: "left" }}>
          <div style={inputWrap}>
            <label style={fieldLabel}>Login</label>
            <input
              style={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              autoComplete="username"
            />
          </div>

          <div style={inputWrap}>
            <label style={fieldLabel}>Parol</label>
            <input
              style={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol"
              autoComplete="current-password"
            />
          </div>

          {err && (
            <div style={{ color: "crimson", marginTop: 6, marginBottom: 6, fontSize: 14 }}>
              {err}
            </div>
          )}

          <div style={checkboxRow}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span style={{ fontSize: 14, color: "#374151", cursor: "pointer" }}>Eslab qolish</span>
            </label>

            <div>
              <Link to="/forgot" style={{ fontSize: 14, color: "#2563EB", textDecoration: "none" }}>
                Parolni unutdingizmi?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Yuklanmoqda..." : "Kirish"}
          </button>

          <div style={{ ...footer, textAlign: "center", marginTop: 14 }}>
            Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'tish</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
