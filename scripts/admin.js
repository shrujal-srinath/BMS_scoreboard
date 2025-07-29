// Parse querystring for code/pwd/newgame
function parseQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get('code') || "",
    pwd: params.get('pwd') || "",
    newgame: !!params.get('newgame')
  };
}

let gameCode, adminPwd, gameData = {};
const PER_DEFAULTS = ["1st", "2nd", "3rd", "4th", "OT"];
const gclockSec = 600, sclockSec = 24;

// --- On Load
window.onload = function() {
  const q = parseQuery();
  adminPwd = q.pwd;
  if (q.newgame) startNewGame(); else if (q.code && q.pwd) loadExistingGame(q.code, q.pwd);
  else alert("Params missing.");
};
window.onbeforeunload = () => { saveGameState(gameCode, gameData); };

function startNewGame() {
  gameCode = Math.floor(100000 + Math.random() * 900000).toString();
  gameData = {
    teamA: "HOME", teamB: "GUEST", scoreA: 0, scoreB: 0,
    foulsA: 0, foulsB: 0, tosA: 3, tosB: 3, period: "1st",
    possession: "A",
    gameClock: gclockSec, shotClock: sclockSec,
    gcRunning: false, scRunning: false,
    password: adminPwd
  };
  saveGameState(gameCode, gameData);
  setUI();
}
function loadExistingGame(code, pwd) {
  const d = loadGameState(code);
  if (!d) { alert("Game does not exist."); window.location='index.html'; return; }
  if (d.password !== pwd) { alert("Wrong password."); window.location='index.html'; return; }
  gameCode = code; adminPwd = pwd;
  gameData = d;
  setUI(); clockLoop();
}
function setUI() {
  document.getElementById("gameCodeDisplay").innerText = gameCode;
  document.getElementById("teamA").value = gameData.teamA; document.getElementById("teamB").value = gameData.teamB;
  document.getElementById("nameA").innerText = gameData.teamA; document.getElementById("nameB").innerText = gameData.teamB;
  document.getElementById("scoreA").innerText = gameData.scoreA; document.getElementById("scoreB").innerText = gameData.scoreB;
  document.getElementById("foulsA").value = gameData.foulsA; document.getElementById("foulsB").value = gameData.foulsB;
  document.getElementById("tosA").value = gameData.tosA; document.getElementById("tosB").value = gameData.tosB;
  document.getElementById("period").value = gameData.period;
  setClocks();
  setPossession();
}

function setClocks() {
  document.getElementById("gameClock").innerText = secToTime(gameData.gameClock);
  document.getElementById("shotClock").innerText = ('0'+gameData.shotClock).slice(-2);
}
function setPossession() {
  document.getElementById("possArrow").innerText = (gameData.possession === "A" ? "———>" : "<———");
}

function secToTime(s) { let m=Math.floor(s/60),ss=s%60;return `${('0'+m).slice(-2)}:${('0'+ss).slice(-2)}`; }
function updateTeamNames() {
  gameData.teamA = document.getElementById("teamA").value || "HOME";
  gameData.teamB = document.getElementById("teamB").value || "GUEST";
  setUI(); saveGameState(gameCode, gameData);
}
function incScore(team, val) {
  if (team==='A') gameData.scoreA+=val; else gameData.scoreB+=val;
  setUI(); saveGameState(gameCode, gameData);
}
function togglePossession() {
  gameData.possession = (gameData.possession==='A'?'B':'A');
  setPossession(); saveGameState(gameCode, gameData);
}
function setFouls(team) {
  if (team==='A') gameData.foulsA=parseInt(document.getElementById("foulsA").value)||0;
  else gameData.foulsB=parseInt(document.getElementById("foulsB").value)||0;
  saveGameState(gameCode, gameData);
}
function setTimeouts(team) {
  if (team==='A') gameData.tosA=parseInt(document.getElementById("tosA").value)||0;
  else gameData.tosB=parseInt(document.getElementById("tosB").value)||0;
  saveGameState(gameCode, gameData);
}
function setPeriod() {
  gameData.period = document.getElementById("period").value;
  saveGameState(gameCode, gameData);
}
// --- Clock management ---
let gInterval, sInterval;
function clockLoop() {
  if(gInterval) clearInterval(gInterval); if(sInterval) clearInterval(sInterval);
  gInterval = setInterval(() => {
    if (gameData.gcRunning && gameData.gameClock>0) {
      gameData.gameClock--;
      setClocks(); saveGameState(gameCode, gameData);
      if(gameData.gameClock<=0) gameData.gcRunning=false;
    }
  }, 1000);
  sInterval = setInterval(() => {
    if (gameData.scRunning && gameData.shotClock>0) {
      gameData.shotClock--;
      setClocks(); saveGameState(gameCode, gameData);
      if(gameData.shotClock<=0) gameData.scRunning=false;
    }
  }, 1000);
}
function toggleGameClock() {
  gameData.gcRunning = !gameData.gcRunning;
  setClocks(); saveGameState(gameCode, gameData);
}
function toggleShotClock() {
  gameData.scRunning = !gameData.scRunning;
  setClocks(); saveGameState(gameCode, gameData);
}
function resetShotClock() {
  gameData.shotClock = sclockSec;
  setClocks(); saveGameState(gameCode, gameData);
}

// --- Edit clocks modal ---
let editTarget='game';
function openEditTime(target) {
  editTarget = target;
  document.getElementById("editTimeTitle").innerText = target==='game'?'Edit Game Clock':'Edit Shot Clock';
  document.getElementById("editTimeInput").value = target==='game'?secToTime(gameData.gameClock) : gameData.shotClock;
  document.getElementById("editTimeModal").classList.remove('hidden');
  document.getElementById("editTimeInput").focus();
}
function closeEditTime() {
  document.getElementById("editTimeModal").classList.add('hidden');
  document.getElementById("editTimeError").classList.add('hidden');
}
function applyEditTime() {
  const val = document.getElementById("editTimeInput").value.trim();
  const pwd = document.getElementById("editTimePwd").value;
  document.getElementById("editTimeError").classList.add('hidden');
  if(pwd!==gameData.password) {
    document.getElementById("editTimeError").classList.remove('hidden'); return;
  }
  if(editTarget==='game') {
    const parts = val.split(':');
    let m=0,s=0;
    if(parts.length===2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      m = parseInt(parts[0]), s = parseInt(parts[1]);
    } else if(parts.length===1 && !isNaN(parts[0])) {
      s = parseInt(parts[0]);
    } else {
      document.getElementById("editTimeError").classList.remove('hidden'); return;
    }
    if(m<0||s<0||m>59||s>59) { document.getElementById("editTimeError").classList.remove('hidden'); return; }
    gameData.gameClock = m*60+s; gameData.gcRunning = false;
  } else {
    let secs = parseInt(val);
    if(isNaN(secs)||secs<0||secs>35){document.getElementById("editTimeError").classList.remove('hidden');return;}
    gameData.shotClock=secs; gameData.scRunning=false;
  }
  setUI(); saveGameState(gameCode, gameData);
  closeEditTime();
}

document.getElementById('resetBtn').onclick = function() {
  const pass = prompt('Enter admin password to reset the game:');
  if(pass!==gameData.password) return alert('Incorrect password.');
  localStorage.removeItem('game-'+gameCode); window.location='index.html';
}

// Cross-tab state sync
window.addEventListener("storage", e=>{ if(e.key==='game-'+gameCode) { gameData=JSON.parse(e.newValue); setUI(); } });

/* --- Hotkeys for advanced users: G/S = edit clocks --- */
document.addEventListener("keydown",e=>{
  if(document.getElementById("editTimeModal").classList.contains('hidden')){
    if(e.key==='g'||e.key==='G') openEditTime('game');
    if(e.key==='s'||e.key==='S') openEditTime('shot');
  }
});
