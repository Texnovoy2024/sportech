const KEY = "player_profiles";

/* LOAD */
export function loadPlayerProfiles() {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

/* SAVE ALL */
export function savePlayerProfiles(players) {
  localStorage.setItem(KEY, JSON.stringify(players));
}

/* GET ONE */
export function getPlayerById(id) {
  const players = loadPlayerProfiles();
  return players.find(p => String(p.id) === String(id));
}

/* UPDATE */
export function updatePlayer(id, newData) {
  const players = loadPlayerProfiles();

  const updated = players.map(p =>
    String(p.id) === String(id)
      ? { ...p, ...newData }
      : p
  );

  savePlayerProfiles(updated);
}

/* DELETE */
export function deletePlayer(id) {
  const players = loadPlayerProfiles()
    .filter(p => String(p.id) !== String(id));

  savePlayerProfiles(players);
}
