import React from "react";
import avatarImg from "../../assets/profile imgs/profile.avif";

export default function CoachProfile() {
  return (
    <div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <img
          src={avatarImg}
          alt="avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0 4px 14px rgba(2,6,23,0.06)",
          }}
        />
        <div>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Ali Valiev</h3>
          <p style={{ margin: "6px 0", color: "#6b7280" }}>
            Murabbiy • FC Progress
          </p>
        </div>
      </div>

      <div className="pl-card">
        <div className="pl-cardTitle">Shaxsiy ma'lumotlar</div>
        <div style={{ marginTop: 14 }}>
          <div>Email: coach@gmail.com</div>
          <div>Telefon: +998 90 123 45 67</div>
          <div>Jamoalar soni: 3</div>
        </div>
      </div>
    </div>
  );
}
