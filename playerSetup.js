// playerSetup.js
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  CACHED_PLAYERS_STORAGE_KEY,
} from "./storage.js";
import { renderCachedNames, renderSelectedPlayers } from "./ui.js";

// Internal state for the players in the current game setup
let players = [];
let renderSetupCallback = null; // Callback to update the main setup UI state

export const getPlayers = () => players;
export const setPlayers = (newPlayers) => {
  players = newPlayers;
};

export const initializePlayerSetup = (updateSetupUI) => {
  renderSetupCallback = updateSetupUI; // Store the callback
  renderCachedNames(
    loadFromLocalStorage(CACHED_PLAYERS_STORAGE_KEY) || [],
    addPlayer
  ); // Render cached names on load
  renderSelectedPlayers(players, removePlayer); // Render initially empty selected players
  renderSetupCallback(); // Initial UI update
};

// Add a player to the setup list and update display
export const addPlayer = (name) => {
  const playerName = name.trim();
  if (playerName && !players.some((p) => p.name === playerName)) {
    players.push({ name: playerName, scores: [], totalScore: 0 });
    renderSelectedPlayers(players, removePlayer); // Update the display of added players
    updateCachedPlayers(playerName); // Add to cache
  } else if (playerName && players.some((p) => p.name === playerName)) {
    alert("Player with this name already added!");
  } else if (!playerName) {
    // Only alert if the input was triggered manually (not from cached name button)
    // This requires checking if the 'name' parameter was provided.
    // For now, keep the alert as it's triggered by the addPlayerBtn click or Enter keypress.
    alert("Please enter a player name.");
  }
  renderSetupCallback(); // Update start button state
};

// Remove a player from the setup list
const removePlayer = (nameToRemove) => {
  players = players.filter((player) => player.name !== nameToRemove);
  renderSelectedPlayers(players, removePlayer); // Re-render the list of players
  renderSetupCallback(); // Update the start game button state
};

// Update cached player names
const updateCachedPlayers = (playerName) => {
  let cachedPlayers = loadFromLocalStorage(CACHED_PLAYERS_STORAGE_KEY) || [];
  if (!cachedPlayers.includes(playerName)) {
    cachedPlayers.push(playerName);
    saveToLocalStorage(CACHED_PLAYERS_STORAGE_KEY, cachedPlayers);
  }
  renderCachedNames(cachedPlayers, addPlayer); // Re-render cached name buttons
};
