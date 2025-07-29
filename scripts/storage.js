// Save state to localStorage
function saveGameState(code, data) {
  localStorage.setItem('game-' + code, JSON.stringify(data));
  window.dispatchEvent(new Event('storage')); // force update in single-tab
}
// Load state from localStorage
function loadGameState(code) {
  const d = localStorage.getItem('game-' + code);
  return d ? JSON.parse(d) : null;
}
