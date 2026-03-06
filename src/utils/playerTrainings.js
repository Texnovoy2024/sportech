// src/utils/playerTrainings.js

const KEY = 'sf_player_trainings_v1';

const EMPTY = {
  events: {},
  sessions: {},
};

export function loadPlayerTrainings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };

    const parsed = JSON.parse(raw);
    return {
      ...EMPTY,
      ...parsed,
      events: parsed.events || {},
      sessions: parsed.sessions || {},
    };
  } catch (e) {
    console.warn('[playerTrainings] load error', e);
    return { ...EMPTY };
  }
}

export function savePlayerTrainings(next) {
  try {
    const toSave = {
      ...EMPTY,
      ...next,
      events: next.events || {},
      sessions: next.sessions || {},
    };
    localStorage.setItem(KEY, JSON.stringify(toSave));
    return toSave;
  } catch (e) {
    console.warn('[playerTrainings] save error', e);
    return null;
  }
}
