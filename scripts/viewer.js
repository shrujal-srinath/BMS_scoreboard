// Get game code from query string
const params = new URLSearchParams(window.location.search);
const code = params.get('code') || '';
let data = {};

function render() {
  data = loadGameState(code);
  if(!data) return;
  document.getElementById('nameA').innerText = data.teamA || 'HOME';
  document.getElementById('nameB').innerText = data.teamB || 'GUEST';
  document.getElementById('scoreA').innerText = data.scoreA;
  document.getElementById('scoreB').innerText = data.scoreB;
  document.getElementById('possArrow').innerText = (data.possession==='A'?'———>':'<———');
  document.getElementById('gameClock').innerText = secToTime(data.gameClock);
  document.getElementById('shotClock').innerText = ('0'+data.shotClock).slice(-2);
  document.getElementById('foulsA').innerText = data.foulsA;
  document.getElementById('foulsB').innerText = data.foulsB;
  document.getElementById('tosA').innerText = data.tosA;
  document.getElementById('tosB').innerText = data.tosB;
  document.getElementById('period').innerText = data.period || '1st';
}
function secToTime(s) { let m=Math.floor(s/60),ss=s%60;return `${('0'+m).slice(-2)}:${('0'+ss).slice(-2)}`; }

window.addEventListener('storage', render);
setInterval(render, 500);
render();
