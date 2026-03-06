// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as auth from "../utils/auth"; // sizning existing utils/auth.js

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Simple AuthProvider.
 * - uses utils/auth.isAuthenticated() to check token in localStorage
 * - exposes login/logout helpers that delegate to utils/auth functions
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // bootstrap auth state from localStorage (utils/auth handles token)
    const check = () => {
      const ok = auth.isAuthenticated?.() ?? Boolean(localStorage.getItem("sf_user_token"));
      if (ok) {
        // optional: read minimal user data from localStorage if you store it
        try {
          const raw = localStorage.getItem("app_user") || localStorage.getItem("sf_user");
          if (raw) setUser(JSON.parse(raw));
          else setUser({ email: "user@local" });
        } catch (e) {
          setUser({ email: "user@local" });
        }
      } else {
        setUser(null);
      }
      setReady(true);
    };

    check();
    // optional: listen to storage events (multi-tab)
    const onStorage = (e) => {
      if (e.key === "sf_user_token" || e.key === "app_token" || e.key === "app_user") {
        check();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (creds) => {
    // loginMock token va (ixtiyoriy) user qaytaradi
    const res = await auth.loginMock(creds);

    let userData = res?.user || null;

    // Agar loginMock user qaytarmagan bo'lsa,
    // register paytida yozilgan app_user dan o'qib qo'yamiz
    if (!userData) {
      try {
        const raw = localStorage.getItem("app_user");
        if (raw) {
          userData = JSON.parse(raw);
        }
      } catch (e) {
        console.error("AuthProvider.login: app_user parse error", e);
      }
    }

    // Hali ham user yo'q bo'lsa, oxirgi fallback (avvalgi logika)
    if (!userData && creds?.email) {
      userData = { email: creds.email };
    }

    if (userData) {
      // MUHIM: bu yerda oldingi role bo'lsa hammasini saqlab qolamiz
      localStorage.setItem("app_user", JSON.stringify(userData));
      setUser(userData);
    } else {
      setUser(null);
    }

    // tashqariga user bilan birga natija qaytaramiz
    return res ?? { user: userData };
  };


  const logout = () => {
    auth.logout?.();
    localStorage.removeItem("app_user");
    setUser(null);
  };

  const value = { user, ready, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
