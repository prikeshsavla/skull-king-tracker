// history.js
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  GAME_HISTORY_STORAGE_KEY,
} from "./storage.js";
import { renderGameHistory as renderHistoryUI } from "./ui.js"; // Import with alias

// Save completed game to history
export const saveGameHistory = (players) => {
  const gameHistory = loadFromLocalStorage(GAME_HISTORY_STORAGE_KEY) || {};
  const timestamp = new Date().toISOString();
  gameHistory[timestamp] = {
    players: players.map((player) => ({
      name: player.name,
      totalScore: player.totalScore,
    })),
  };
  saveToLocalStorage(GAME_HISTORY_STORAGE_KEY, gameHistory);
  renderHistoryUI(gameHistory); // Update the history display after saving
};

// Load and display game history on page load
export const loadAndRenderGameHistory = () => {
  const gameHistory = loadFromLocalStorage(GAME_HISTORY_STORAGE_KEY) || {};
  renderHistoryUI(gameHistory);
};
