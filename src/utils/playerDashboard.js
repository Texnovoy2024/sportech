// src/utils/playerDashboard.js
const KEY = 'sf_player_dashboard_v1'

export function loadPlayerDashboard(playerId) {
  const raw = localStorage.getItem(KEY)
  const all = raw ? JSON.parse(raw) : {}
  return all[playerId] || {}
}

export function savePlayerDashboard(playerId, data) {
  const raw = localStorage.getItem(KEY)
  const all = raw ? JSON.parse(raw) : {}

  all[playerId] = {
    ...(all[playerId] || {}),
    ...data,
    updatedAt: Date.now(),
  }

  localStorage.setItem(KEY, JSON.stringify(all))
}
