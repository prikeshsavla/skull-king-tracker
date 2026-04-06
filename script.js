// script.js
import {
  initializePlayerSetup,
  addPlayer as addPlayerToSetup,
  clearPlayers,
  getPlayers,
} from "./playerSetup.js";
import {
  clearActiveGame,
  initializeGame,
  calculateRoundScore,
  nextRound,
  startNewGame as resetGameUI,
} from "./game.js"; // Alias startNewGame to avoid confusion
import {
  clearGameHistory,
  loadAndRenderGameHistory,
  updateHistorySortOrder,
} from "./history.js";
import {
  ACTIVE_GAME_STORAGE_KEY,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "./storage.js";
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
  const historySortSelect = document.getElementById("history-sort-select");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

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
    historySortSelect,
    clearHistoryBtn,
  });

  // --- Initialize Modules ---
  // Pass a callback to playerSetup to update the start game button state
  initializePlayerSetup(() => {
    startGameBtn.disabled = getPlayers().length < 2;
  });
  loadAndRenderGameHistory(); // Load and display history on page load

  const savedActiveGame = loadFromLocalStorage(ACTIVE_GAME_STORAGE_KEY);
  const hasRestorableGame =
    savedActiveGame &&
    Array.isArray(savedActiveGame.players) &&
    savedActiveGame.players.length >= 2 &&
    typeof savedActiveGame.currentRound === "number";

  if (hasRestorableGame) {
    const restoreGame = confirm(
      "An unfinished game was found. Would you like to restore it?"
    );

    if (restoreGame) {
      initializeGame(savedActiveGame.players, {
        gameAreaDiv,
        playerSetupDiv,
        currentRoundTitle,
        calculateRoundBtn,
        nextRoundBtn,
      }, savedActiveGame);
    } else {
      removeFromLocalStorage(ACTIVE_GAME_STORAGE_KEY);
    }
  }

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
      clearPlayers();
      clearActiveGame();
      newPlayerNameInput.value = "";
    }
  });

  historySortSelect.addEventListener("change", (event) => {
    updateHistorySortOrder(event.target.value);
  });

  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear all saved game history from this browser?")) {
      clearGameHistory();
    }
  });
});
