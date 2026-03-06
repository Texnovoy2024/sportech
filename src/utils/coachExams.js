const KEY = "sf_coach_exams_v1";

const EMPTY = {
  exams: [],
};

export function loadCoachExams() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };

    const parsed = JSON.parse(raw);
    return {
      ...EMPTY,
      ...parsed,
      exams: Array.isArray(parsed.exams) ? parsed.exams : [],
    };
  } catch (e) {
    console.warn("[coachExams] load error", e);
    return { ...EMPTY };
  }
}

export function saveCoachExams(exams) {
  try {
    const toSave = {
      exams: Array.isArray(exams) ? exams : [],
    };
    localStorage.setItem(KEY, JSON.stringify(toSave));
    return toSave;
  } catch (e) {
    console.warn("[coachExams] save error", e);
    return null;
  }
}

export function deleteCoachExam(id) {
  const current = loadCoachExams();
  const filtered = current.exams.filter(
    (e) => String(e.id) !== String(id)
  );
  saveCoachExams(filtered);
  return filtered;
}
