// script.js
import {
  initializePlayerSetup,
  addPlayer as addPlayerToSetup,
  getPlayers,
} from "./playerSetup.js";
import {
  initializeGame,
  calculateRoundScore,
  nextRound,
  startNewGame as resetGameUI,
} from "./game.js"; // Alias startNewGame to avoid confusion
import { loadAndRenderGameHistory, saveGameHistory } from "./history.js";
import { setUIReferences } from "./ui.js"; // Import function to set UI refs

document.addEventListener("DOMContentLoaded", () => {
  // --- Get DOM Element References ---
  const playerSetupDiv = document.getElementById("player-setup");
  const gameAreaDiv = document.getElementById("game-area");
  const cachedNamesButtonsDiv = document.getElementById("cached-names-buttons");
  const noCachedNamesMessage = document.getElementById("no-cached-names");
  const selectedPlayersDiv = document.getElementById("selected-players");
  const playerListUl = document.getElementById("player-list");
  const newPlayerNameInput = document.getElementById("new-player-name");
  const addPlayerBtn = document.getElementById("add-player-btn");
  const startGameBtn = document.getElementById("start-game-btn");
  const scoreTable = document.getElementById("score-table");
  const scoreTableHead = scoreTable.querySelector("thead");
  const scoreTableBody = document.getElementById("score-table-body");
  const scoreTableFoot = document.getElementById("score-table-foot");
  const currentRoundTitle = document.getElementById("current-round-title");
  const currentRoundInputsDiv = document.getElementById("current-round-inputs");
  const calculateRoundBtn = document.getElementById("calculate-round-btn");
  const nextRoundBtn = document.getElementById("next-round-btn");
  const newGameBtn = document.getElementById("new-game-btn");
  const historyTable = document.getElementById("history-table");
  const historyTableHead = historyTable.querySelector("thead");
  const historyTableBody = document.getElementById("history-table-body");

  // --- Set UI References in ui.js ---
  setUIReferences({
    playerListUl,
    cachedNamesButtonsDiv,
    noCachedNamesMessage,
    scoreTableHead,
    scoreTableBody,
    scoreTableFoot,
    currentRoundInputsDiv,
    historyTableHead,
    historyTableBody,
  });

  // --- Initialize Modules ---
  // Pass a callback to playerSetup to update the start game button state
  initializePlayerSetup(() => {
    startGameBtn.disabled = getPlayers().length < 2;
  });
  loadAndRenderGameHistory(); // Load and display history on page load

  // --- Event Listeners ---

  addPlayerBtn.addEventListener("click", () => {
    addPlayerToSetup(newPlayerNameInput.value);
    newPlayerNameInput.value = ""; // Clear input after adding
  });

  newPlayerNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addPlayerToSetup(newPlayerNameInput.value);
      newPlayerNameInput.value = ""; // Clear input after adding
    }
  });

  startGameBtn.addEventListener("click", () => {
    const playersForGame = getPlayers();
    if (playersForGame.length >= 2) {
      // Reset scores for the players starting a new game
      playersForGame.forEach((player) => {
        player.scores = [];
        player.totalScore = 0;
      });
      initializeGame(playersForGame, {
        gameAreaDiv,
        playerSetupDiv,
        currentRoundTitle,
        calculateRoundBtn,
        nextRoundBtn,
      });
    } else {
      alert("You need at least 2 players to start.");
    }
  });

  calculateRoundBtn.addEventListener("click", calculateRoundScore);

  nextRoundBtn.addEventListener("click", nextRound);

  newGameBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to start a new game? This will clear the current game."
      )
    ) {
      resetGameUI(); // Reset the game UI
      // Reset player setup state manually here
      addPlayerToSetup(""); // Reset players array internally in playerSetup
      playerListUl.innerHTML =
        '<li class="text-gray-600 italic">No players added yet.</li>'; // Reset selected players display
      startGameBtn.disabled = true; // Disable start button
    }
  });
});
