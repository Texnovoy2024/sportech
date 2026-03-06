// src/pages/player/Medical.jsx
import React, { useState, useRef } from "react";
import styles from "./Medical.module.css";

/**
 * Props:
 *  - user: { id: string|number, role: 'player'|'medical'|'admin', playerId?: string }
 *  - records: optional array of medical records (if not provided component uses demo data)
 *
 * Note:
 *  - Only users with role === 'medical' will see "Edit" / "Add record" controls.
 *  - Players will only see their own record (matching user.playerId or user.id).
 */

const demoRecords = [
  {
    id: "r1",
    playerId: "p1",
    name: "Ali Valiev",
    dob: "2003-04-12",
    lastInjuryDate: "2023-08-15",
    summary: "Tizza payining cho'zilishi — kuzatilmoqda",
    severityPercent: 75,
    notes: "Davolanish rejasi: Diagnostika va yengil mashqlar",
    updatedAt: "2024-07-01",
  },
  {
    id: "r2",
    playerId: "p2",
    name: "Sardor Rashidov",
    dob: "2004-01-05",
    lastInjuryDate: "2023-07-18",
    summary: "To'pingin sinishi — reabilitatsiya davom etmoqda",
    severityPercent: 40,
    notes: "Fizioterapiya kursi",
    updatedAt: "2024-06-20",
  },
];

export default function Medical({ user = { id: "p1", role: "player", playerId: "p1" }, records = demoRecords }) {
  const containerRef = useRef(null);

  // find the record(s) visible to this user
  let visibleRecords = [];
  if (user.role === "medical") {
    // medical staff can see all records
    visibleRecords = records;
  } else {
    // players see only their own record (match by playerId or id)
    const pid = user.playerId ?? user.id;
    visibleRecords = records.filter((r) => String(r.playerId) === String(pid));
  }

  // if no record found for player, show empty state (player can't add — only medical can)
  const [selected, setSelected] = useState(visibleRecords[0] ?? null);

  // PDF download using html2canvas + jsPDF if available; else fallback to window.print
  const downloadPDF = async () => {
    // try dynamic import to avoid build errors when packages are not installed
    try {
      const [{ default: jsPDF }, html2canvas] = await Promise.all([
        import("jspdf").then((m) => m.default ? m.default : m),
        import("html2canvas").then((m) => m.default ? m.default : m),
      ]);
      const el = containerRef.current;
      if (!el) throw new Error("Content not found");

      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // fit image into page with aspect
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 48; // margins
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 24, 24, imgWidth, imgHeight);
      pdf.save(`${selected ? selected.name.replace(/\s+/g, "_") : "medical_record"}.pdf`);
    } catch (err) {
      // fallback: open print dialog
      console.warn("jsPDF/html2canvas not available or failed — falling back to print", err);
      window.print();
    }
  };

  // UI: if no visible records (player with no record)
  if (visibleRecords.length === 0) {
    return (
      <div className={styles["med-page"]}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Mening sog'liq kartam</h1>
        <div className={styles["med-detail-card"]}>
          <p>Sizga hali tibbiy yozuv kiritilmagan.</p>
          {user.role === "medical" ? (
            <p>Yozuv qo'shish uchun “Add record” tugmasi (tibbiy xodimlar uchun) ko'rinadi.</p>
          ) : (
            <p>Iltimos, trainer yoki tibbiy xodim bilan bog'laning.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles["med-page"]}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h1 className="med-title">Mening sog'liq kartam</h1>


        <div style={{ display: "flex", gap: 8 }}>
          {/* PDF download available to the player and medical staff */}
          <button className={styles["med-btn"]} onClick={downloadPDF}>
            PDF yuklab olish
          </button>

          {user.role === "medical" && (
            <button className={styles["med-btn-primary"]} onClick={() => alert("Yozuv qo'shish modalini bu yerga qo'yishingiz mumkin")}>
              Yangi yozuv qo'shish
            </button>
          )}
        </div>
      </div>

      <div className={styles["med-grid"]}>
        {/* LEFT: list */}
        <div>
          <div className={styles["med-patient-list"]}>
            {visibleRecords.map((r) => (
              <div
                key={r.id}
                className={styles["med-patient"]}
                onClick={() => setSelected(r)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelected(r)}
                style={{
                  border: selected?.id === r.id ? "1.5px solid #0b3be6" : "1px solid transparent",
                }}
                aria-pressed={selected?.id === r.id}
              >
                <div className={styles["med-avatar"]}>
                  {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>

                <div className={styles["med-patient-info"]}>
                  <div className={styles["med-patient-name"]}>{r.name}</div>
                  <div className={styles["med-patient-sub"]}>
                    Last injury: {r.lastInjuryDate} • Severity: {r.severityPercent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: selected detail */}
        <div>
          {selected ? (
            <div ref={containerRef} className={styles["med-detail-card"]}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0 }}>{selected.name}</h2>
                  <div style={{ color: "#6b7280", marginTop: 6 }}>Tug'ilgan sana: {selected.dob}</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{selected.severityPercent}%</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Og'irlik (severity)</div>
                </div>
              </div>

              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #eef4f6" }} />

              <p style={{ marginTop: 0 }}>
                <strong>Jarohat sanasi:</strong> {selected.lastInjuryDate}
              </p>

              <p style={{ marginTop: 6 }}>
                <strong>Qisqacha:</strong> {selected.summary}
              </p>

              <div style={{ marginTop: 10 }}>
                <strong>Davolanish rejasi:</strong>
                <ul style={{ marginTop: 8 }}>
                  {selected.notes ? (
                    <li>{selected.notes}</li>
                  ) : (
                    <li>Davolanish rejasi mavjud emas</li>
                  )}
                </ul>
              </div>

              <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
                Soʻnggi yangilanish: {selected.updatedAt}
              </div>

              {/* Only medical role can edit */}
              {user.role === "medical" && (
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button className={styles["med-btn-primary"]} onClick={() => alert("Edit record modal ochilsin (tibbiy rol)")}>
                    Tahrirlash
                  </button>
                  <button className={styles["med-btn"]} onClick={() => alert("Delete confirmation va o'chirish tibbiy xodimga")}>
                    O'chirish
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles["med-detail-card"]}>
              <p>Roʻyxatdan tanlang yoki kuting — yozuv topilmadi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
