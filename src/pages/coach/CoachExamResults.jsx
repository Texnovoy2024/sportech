import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadCoachExams } from "../../utils/coachExams";
import {
  loadExamResults,
  saveExamResults,
} from "../../utils/coachExamResults";
import "./CoachExamResults.css";

export default function CoachExamResults() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [players, setPlayers] = useState([]);

  /* LOAD EXAM + RESULTS */
  useEffect(() => {
  const examsData = loadCoachExams();
  const examsList = examsData?.exams || [];

  const foundExam = examsList.find(
    (e) => String(e.id) === String(examId)
  );

  if (!foundExam) {
    console.warn("Exam not found, redirecting…");
    navigate("/coach/exams");
    return;
  }

  setExam(foundExam);

  const savedResults = loadExamResults(examId);
  setPlayers(
    savedResults.length
      ? savedResults
      : [
          {
            id: 1,
            name: "Aliyev Aziz",
            result: "",
            status: "Kutilmoqda",
            note: "",
          },
          {
            id: 2,
            name: "Karimov Bekzod",
            result: "",
            status: "Kutilmoqda",
            note: "",
          },
        ]
  );
}, [examId, navigate]);


  const updatePlayer = (id, field, value) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSave = () => {
    saveExamResults(examId, players);
    alert("Natijalar saqlandi ✅");
  };

  if (!exam) {
    return <p>Imtihon topilmadi</p>;
  }

  return (
    <div className="exam-results-page">
      {/* HEADER */}
      <div className="results-header">
        <div>
          <h1>{exam.title}</h1>
          <p>
            Normativ: <strong>{exam.norm}</strong> · Sana:{" "}
            <strong>{exam.date}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="ghost-button"
            onClick={() => navigate("/coach/exams")}
          >
            ← Imtihonlarga qaytish
          </button>

          <button className="primary-button" onClick={handleSave}>
            Saqlash
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="results-card">
        <table className="results-table">
          <thead>
            <tr>
              <th>Futbolchi</th>
              <th>Natija</th>
              <th>Status</th>
              <th>Izoh</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  <input
                    value={p.result}
                    onChange={(e) =>
                      updatePlayer(p.id, "result", e.target.value)
                    }
                    placeholder="Masalan: 7.8 s"
                  />
                </td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) =>
                      updatePlayer(p.id, "status", e.target.value)
                    }
                  >
                    <option>Kutilmoqda</option>
                    <option>O‘tdi</option>
                    <option>O‘tmadi</option>
                  </select>
                </td>
                <td>
                  <input
                    value={p.note}
                    onChange={(e) =>
                      updatePlayer(p.id, "note", e.target.value)
                    }
                    placeholder="Murabbiy izohi"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
