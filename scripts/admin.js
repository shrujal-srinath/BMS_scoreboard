let gameCode;
let gameData = {};

function createNewGame() {
  const teamA = document.getElementById("teamA").value;
  const teamB = document.getElementById("teamB").value;
  const pass = document.getElementById("adminPassword").value;
  if (!teamA || !teamB || !pass) {
    alert("Please enter all fields.");
    return;
  }

  gameCode = Math.floor(100000 + Math.random() * 900000);
  gameData = {
    teamA, teamB,
    scoreA: 0, scoreB: 0,
    password: pass,
    possession: 'A'
  };

  saveGameState(gameCode, gameData);
  document.getElementById("controls").style.display = "block";
  document.getElementById("gameCodeDisplay").innerText = `Game Code: ${gameCode}`;
  updateScores();
}

function addPoints(team, pts) {
  gameData[`score${team}`] += pts;
  saveGameState(gameCode, gameData);
  updateScores();
}

function togglePossession() {
  gameData.possession = gameData.possession === 'A' ? 'B' : 'A';
  saveGameState(gameCode, gameData);
}

function updateScores() {
  document.getElementById("scoreA").innerText = gameData.scoreA;
  document.getElementById("scoreB").innerText = gameData.scoreB;
}

function resetGame() {
  const confirmPass = prompt("Enter admin password to reset:");
  if (confirmPass === gameData.password) {
    localStorage.removeItem(`game-${gameCode}`);
    window.location.reload();
  } else {
    alert("Incorrect password. Cannot reset game.");
  }
}
