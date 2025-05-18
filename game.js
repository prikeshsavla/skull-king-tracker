// game.js
import {
  renderScoreTableHeaders,
  renderCurrentRoundInputs,
  renderRoundScores,
  updateTotalScores,
} from "./ui.js";
import { saveGameHistory } from "./history.js";

// Game state
let players = [];
let currentRound = 1;
const maxRounds = 10;

// DOM references (will be passed from script.js)
let gameAreaDiv;
let playerSetupDiv;
let currentRoundTitle;
let calculateRoundBtn;
let nextRoundBtn;

export const initializeGame = (initialPlayers, refs) => {
  players = initialPlayers;
  gameAreaDiv = refs.gameAreaDiv;
  playerSetupDiv = refs.playerSetupDiv;
  currentRoundTitle = refs.currentRoundTitle;
  calculateRoundBtn = refs.calculateRoundBtn;
  nextRoundBtn = refs.nextRoundBtn;

  playerSetupDiv.classList.add("hidden");
  gameAreaDiv.classList.remove("hidden");
  currentRound = 1;
  renderScoreTableHeaders(players);
  renderCurrentRoundInputs(players, currentRound);
  updateRoundTitle();
  calculateRoundBtn.classList.remove("hidden");
  nextRoundBtn.classList.add("hidden");
};

const updateRoundTitle = () => {
  currentRoundTitle.textContent = `Round ${currentRound}`;
};

// Calculate scores for the current round
export const calculateRoundScore = () => {
  const bids = [];
  const tricksWon = [];
  const bonuses = [];
  let validationFailed = false;

  players.forEach((player, index) => {
    if (validationFailed) return;

    const bidInput = document.getElementById(`bid-input-player-${index}`);
    const tricksInput = document.getElementById(
      `tricks-won-input-player-${index}`
    );
    const bonusInput = document.getElementById(`bonus-input-player-${index}`);

    const won = parseInt(tricksInput.value) || 0;
    const bid = parseInt(bidInput.value) || 0;
    const bonus = parseInt(bonusInput.value) || 0;

    // --- Individual Player Tricks Won Validation ---
    if (won < 0 || won > currentRound) {
      // Added check for negative tricks won
      alert(
        `Error: ${player.name}'s 'Tricks Won' value (${won}) is invalid for Round ${currentRound}. Please correct it.`
      );
      validationFailed = true;
      return;
    }
    // --- End Individual Player Tricks Won Validation ---

    bids.push(bid);
    tricksWon.push(won);
    bonuses.push(bonus);
  });

  // --- Stop if individual validation failed ---
  if (validationFailed) {
    return;
  }
  // --- End Stop if individual validation failed ---

  // --- Total Tricks Won Validation (Accounting for Kraken) ---
  const totalTricksWon = tricksWon.reduce((sum, current) => sum + current, 0);
  // Valid total tricks won are equal to the round number OR one less than the round number
  if (totalTricksWon !== currentRound && totalTricksWon !== currentRound - 1) {
    alert(
      `Error: The total number of tricks won by players (${totalTricksWon}) must equal ${currentRound} or ${
        currentRound - 1
      } (if the Kraken won the trick). Please adjust the 'Tricks Won' values.`
    );
    return; // Exit the function if validation fails
  }
  // --- End Total Tricks Won Validation ---

  console.log("--- Calculating Round Score (Round " + currentRound + ") ---");
  console.log(
    "Players:",
    players.map((p) => p.name)
  );
  console.log("Bids:", bids);
  console.log("Tricks Won:", tricksWon);
  console.log("Bonuses:", bonuses);

  const roundScores = players.map((player, index) => {
    const bid = bids[index];
    const won = tricksWon[index];
    const bonus = bonuses[index];
    let score = 0;

    if (bid === won) {
      if (bid === 0) {
        score = currentRound * 10;
      } else {
        score = bid * 20;
      }
      score += bonus;
    } else {
      if (bid === 0) {
        score = currentRound * -10;
      } else {
        score = Math.abs(bid - won) * -10;
      }
    }

    return score;
  });

  console.log("Round Scores:", roundScores);
  console.log("---------------------------------------------");

  // Update players state with new scores
  players.forEach((player, index) => {
    player.scores.push(roundScores[index]);
    player.totalScore += roundScores[index];
  });

  renderRoundScores(players, currentRound);
  updateTotalScores(players);

  calculateRoundBtn.classList.add("hidden");

  if (currentRound === maxRounds) {
    alert("Game Over! Check the scores.");
    saveGameHistory(players); // Save completed game history
    nextRoundBtn.classList.add("hidden");
  } else {
    nextRoundBtn.classList.remove("hidden");
  }
};

// Move to the next round
export const nextRound = () => {
  currentRound++;
  if (currentRound <= maxRounds) {
    updateRoundTitle();
    renderCurrentRoundInputs(players, currentRound);
    calculateRoundBtn.classList.remove("hidden");
    nextRoundBtn.classList.add("hidden");
    // Clear input values for the new round
    document
      .querySelectorAll("#current-round-inputs input")
      .forEach((input) => (input.value = 0));
    // Clear round score in footer
    document
      .querySelectorAll("#round-score-row td:not(:first-child)")
      .forEach((td) => (td.textContent = "0"));
  } else {
    // Should not happen if nextRoundBtn is hidden after round 10
    alert("Game finished!");
    nextRoundBtn.classList.add("hidden");
  }
};

// Reset game state for a new game
export const startNewGame = () => {
  players = []; // Clear players for new game setup
  currentRound = 1;

  // Clear UI elements related to the game area
  document.getElementById("score-table-body").innerHTML = "";
  document.getElementById("current-round-inputs").innerHTML = "";
  document
    .querySelectorAll("#round-score-row td:not(:first-child)")
    .forEach((td) => td.remove());
  document
    .querySelectorAll("#total-score-row td:not(:first-child)")
    .forEach((td) => td.remove());

  gameAreaDiv.classList.add("hidden");
  playerSetupDiv.classList.remove("hidden");

  // Reset player setup state manually here
  // Assuming addPlayerToSetup is used to add players to the setup state
  // In script.js, when clicking New Game, we'll need to reset the players array
  // in playerSetup.js and update its UI via initializePlayerSetup or similar.
  // For now, let's ensure the players array in game.js is cleared.
  // Note: The player setup UI needs to be reset separately.
};
