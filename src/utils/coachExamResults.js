const KEY = "sf_coach_exam_results_v1";

const EMPTY = {
  resultsByExam: {},
};

export function loadExamResults(examId) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return parsed.resultsByExam?.[examId] || [];
  } catch {
    return [];
  }
}

export function saveExamResults(examId, players) {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : EMPTY;

    const next = {
      ...parsed,
      resultsByExam: {
        ...parsed.resultsByExam,
        [examId]: players,
      },
    };

    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}
