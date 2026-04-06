// history.js
import {
  loadFromLocalStorage,
  GAME_HISTORY_STORAGE_KEY,
  removeFromLocalStorage,
  saveToLocalStorage,
} from "./storage.js";
import { renderGameHistory as renderHistoryUI } from "./ui.js"; // Import with alias

let historySortOrder = "newest";

const renderStoredGameHistory = () => {
  const gameHistory = loadFromLocalStorage(GAME_HISTORY_STORAGE_KEY) || {};
  renderHistoryUI(gameHistory, { sortOrder: historySortOrder });
};

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
  renderHistoryUI(gameHistory, { sortOrder: historySortOrder }); // Update the history display after saving
};

// Load and display game history on page load
export const loadAndRenderGameHistory = () => {
  renderStoredGameHistory();
};

export const updateHistorySortOrder = (sortOrder) => {
  historySortOrder = sortOrder;
  renderStoredGameHistory();
};

export const clearGameHistory = () => {
  removeFromLocalStorage(GAME_HISTORY_STORAGE_KEY);
  renderStoredGameHistory();
};
