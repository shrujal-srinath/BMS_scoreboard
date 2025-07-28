function saveGameState(code, obj) {
  localStorage.setItem(`game-${code}`, JSON.stringify(obj));
}

function loadGameState(code) {
  const data = localStorage.getItem(`game-${code}`);
  return data ? JSON.parse(data) : null;
}
