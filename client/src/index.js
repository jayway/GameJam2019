import { bindKey, KEYS } from "./keyboard";
import "./main.css";

require("./draw-canvas");

let PlayerTexture;
let BulletTexture;
let ws;

let id;
let state;

/**
 * Renders the game according to the newState object
 * @param {object} newState
 */
function render(newState) {
  state = state || newState; // handle first state update

  const serverPlayers = Object.keys(newState.players);
  const clientPlayers = Object.keys(state.players);

  const alivePlayers = serverPlayers.filter(x => clientPlayers.includes(x));
  const deadPlayers = clientPlayers.filter(x => !serverPlayers.includes(x));

  state = newState;
}

const renderTimeLeft = timeLeft => {
  document.getElementById("timeleft").innerText = timeLeft;
};

/**
 * Handles a message from the server
 * @param {{data: { type: string, value: any}}} message
 * @param {WebSocket} ws
 */
function handleMessage(message) {
  const data = JSON.parse(message.data);
  if (data.type === "id") {
    id = data.value;
    Object.values(KEYS).forEach(key => bindKey(id, key, ws));
  } else if (data.type === "ping") {
    ws.send(JSON.stringify({ id, type: "pong" }));
  } else if (data.type === "state") {
    renderTimeLeft(data.value.game.timeLeft);
    // Render players, their points and current timer.
    if (data.value.game.phase === "guess") {
      console.log(data.value);
    } else if (data.value.game.phase === "scoring") {
      // Show the score and the result
      // Wait for players to click "ready"
      console.log("Scoring Phase!");
    } else if (data.type === "drawing") {
      // Draw on the image until timeout
    }
    console.log(data.value.game);
  }
}

/**
 * Initiates a connection to the server
 */
function initiateSockets() {
  const url = "127.0.0.1";
  const port = 3000;
  ws = new WebSocket(`ws://${url}:${port}`);
  ws.onmessage = message => handleMessage(message);
}

function sendGuess() {
  const { value } = document.querySelector('[name="guessInput"]');
  ws.send(JSON.stringify({ id, guess: value }));
}

function setupForms() {
  document
    .querySelector('[name="guessButton"]')
    .addEventListener("click", sendGuess);
}

/**
 * Starts the game
 */
async function main() {
  // await loadAssets();
  initiateSockets();
  setupForms();
}

main();
