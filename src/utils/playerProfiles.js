// src/utils/playerProfiles.js
const KEY = 'sf_player_profiles_v1'

const EMPTY = {
  players: [],
  configured: false,
}

export function loadPlayerProfiles() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw)

    const players = Array.isArray(parsed.players) ? parsed.players : []

    return {
      ...EMPTY,
      ...parsed,
      players: players.map(p => ({
        avatarUrl: '',      
        ...p,              
      })),
    }
  } catch (e) {
    console.warn('[playerProfiles] load error', e)
    return { ...EMPTY }
  }
}

export function savePlayerProfiles(partial) {
  try {
    const merged = {
      ...EMPTY,
      ...partial,
      players: Array.isArray(partial.players) ? partial.players : [],
      configured: true,
    }
    localStorage.setItem(KEY, JSON.stringify(merged))
    return merged
  } catch (e) {
    console.warn('[playerProfiles] save error', e)
    return null
  }
}

export function findPlayerById(playerId) {
  const store = loadPlayerProfiles()
  return store.players.find(p => p.playerId === playerId) || null
}

export function findPlayerByInternalId(id) {
  const store = loadPlayerProfiles()
  return store.players.find(p => p.id === id) || null
}
