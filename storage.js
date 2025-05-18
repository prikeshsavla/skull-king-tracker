// storage.js

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving data with key "${key}" to local storage:`, e);
  }
};

export const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(
      `Error loading data with key "${key}" from local storage:`,
      e
    );
    return null;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(
      `Error removing data with key "${key}" from local storage:`,
      e
    );
  }
};

// --- Local Storage Keys ---
export const CACHED_PLAYERS_STORAGE_KEY = "skullKingCachedPlayers";
export const GAME_HISTORY_STORAGE_KEY = "skullKingGameHistory";
