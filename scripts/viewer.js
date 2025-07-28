const code = prompt("Enter 6-digit game code:");
const display = () => {
  const data = loadGameState(code);
  if (!data) return alert("Invalid code.");

  document.getElementById("nameA").innerText = data.teamA;
  document.getElementById("nameB").innerText = data.teamB;
  document.getElementById("scoreA").innerText = data.scoreA;
  document.getElementById("scoreB").innerText = data.scoreB;
  document.getElementById("possArrow").innerText = data.possession === 'A' ? '←' : '→';
};

window.addEventListener("storage", display);
setInterval(display, 500);
display();
