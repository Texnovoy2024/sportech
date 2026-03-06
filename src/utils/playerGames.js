// src/utils/playerGames.js

const KEY = "sf_player_games_v2";

const EMPTY = {
  games: [],     
  configured: false,
};

export function loadPlayerGames() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };

    const parsed = JSON.parse(raw);
    return {
      ...EMPTY,
      ...parsed,
      games: Array.isArray(parsed.games) ? parsed.games : [],
    };
  } catch (e) {
    console.warn("[playerGames] load error", e);
    return { ...EMPTY };
  }
}

export function savePlayerGames(partial) {
  try {
    const merged = {
      ...EMPTY,
      ...partial,
      games: Array.isArray(partial.games) ? partial.games : [],
      configured: true,
    };
    localStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.warn("[playerGames] save error", e);
    return null;
  }
}
