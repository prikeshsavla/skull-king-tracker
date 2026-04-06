// game.js
import {
  renderScoreTableHeaders,
  renderCurrentRoundInputs,
  renderRoundScores,
  updateTotalScores,
} from "./ui.js";
import { saveGameHistory } from "./history.js";
import {
  ACTIVE_GAME_STORAGE_KEY,
  removeFromLocalStorage,
  saveToLocalStorage,
} from "./storage.js";

// Game state
let players = [];
let currentRound = 1;
let roundCalculated = false;
const maxRounds = 10;

// DOM references (will be passed from script.js)
let gameAreaDiv;
let playerSetupDiv;
let currentRoundTitle;
let calculateRoundBtn;
let nextRoundBtn;
let roundProgressSummary;
let roundValidationMessage;

const clonePlayers = (playersToClone) =>
  playersToClone.map((player) => ({
    name: player.name,
    scores: [...player.scores],
    totalScore: player.totalScore,
  }));

const getCompletedRoundsCount = () =>
  players.reduce(
    (maxCompletedRounds, player) =>
      Math.max(maxCompletedRounds, player.scores.length),
    0
  );

const getCurrentDraftInputs = () =>
  players.map((player, index) => {
    const bidInput = document.getElementById(`bid-input-player-${index}`);
    const tricksInput = document.getElementById(
      `tricks-won-input-player-${index}`
    );
    const bonusInput = document.getElementById(`bonus-input-player-${index}`);

    return {
      bid: parseInt(bidInput?.value, 10) || 0,
      tricksWon: parseInt(tricksInput?.value, 10) || 0,
      bonus: parseInt(bonusInput?.value, 10) || 0,
    };
  });

const applyDraftInputs = (draftInputs = []) => {
  draftInputs.forEach((draftInput, index) => {
    const bidInput = document.getElementById(`bid-input-player-${index}`);
    const tricksInput = document.getElementById(
      `tricks-won-input-player-${index}`
    );
    const bonusInput = document.getElementById(`bonus-input-player-${index}`);

    if (bidInput) bidInput.value = draftInput.bid ?? 0;
    if (tricksInput) tricksInput.value = draftInput.tricksWon ?? 0;
    if (bonusInput) bonusInput.value = draftInput.bonus ?? 0;
  });
};

const persistActiveGame = () => {
  if (players.length === 0) {
    return;
  }

  saveToLocalStorage(ACTIVE_GAME_STORAGE_KEY, {
    players: clonePlayers(players),
    currentRound,
    draftInputs: getCurrentDraftInputs(),
    roundCalculated,
    savedAt: new Date().toISOString(),
  });
};

export const clearActiveGame = () => {
  removeFromLocalStorage(ACTIVE_GAME_STORAGE_KEY);
};

const handleDraftInputsChanged = () => {
  clearValidationMessage();
  updateRoundProgressSummary();
  persistActiveGame();
};

export const initializeGame = (initialPlayers, refs, savedState = null) => {
  players = clonePlayers(initialPlayers);
  gameAreaDiv = refs.gameAreaDiv;
  playerSetupDiv = refs.playerSetupDiv;
  currentRoundTitle = refs.currentRoundTitle;
  calculateRoundBtn = refs.calculateRoundBtn;
  nextRoundBtn = refs.nextRoundBtn;
  roundProgressSummary = document.getElementById("round-progress-summary");
  roundValidationMessage = document.getElementById("round-validation-message");

  playerSetupDiv.classList.add("hidden");
  gameAreaDiv.classList.remove("hidden");
  currentRound = savedState?.currentRound || 1;
  roundCalculated = savedState?.roundCalculated || false;
  document.getElementById("score-table-body").innerHTML = "";
  renderScoreTableHeaders(players);

  for (let roundNumber = 1; roundNumber <= getCompletedRoundsCount(); roundNumber++) {
    renderRoundScores(players, roundNumber);
  }

  updateTotalScores(players);
  renderCurrentRoundInputs(players, currentRound, handleDraftInputsChanged);
  applyDraftInputs(savedState?.draftInputs);
  updateRoundTitle();
  updateRoundProgressSummary();
  clearValidationMessage();
  calculateRoundBtn.classList.toggle("hidden", roundCalculated);
  nextRoundBtn.classList.toggle("hidden", !roundCalculated);
  persistActiveGame();
};

const updateRoundTitle = () => {
  currentRoundTitle.textContent = `Round ${currentRound}`;
};

const setValidationMessage = (message) => {
  if (!roundValidationMessage) {
    return;
  }

  roundValidationMessage.textContent = message;
  roundValidationMessage.classList.remove("hidden");
};

const clearValidationMessage = () => {
  if (!roundValidationMessage) {
    return;
  }

  roundValidationMessage.textContent = "";
  roundValidationMessage.classList.add("hidden");
};

const updateRoundProgressSummary = () => {
  if (!roundProgressSummary) {
    return;
  }

  const totalTricksEntered = getCurrentDraftInputs().reduce(
    (sum, draftInput) => sum + draftInput.tricksWon,
    0
  );
  const roundStateLabel = roundCalculated
    ? "Round locked in. Review scores or move to the next round."
    : `Tricks entered: ${totalTricksEntered}/${currentRound}. Kraken rounds may total ${
        currentRound - 1
      }.`;

  roundProgressSummary.textContent = roundStateLabel;
};

// Calculate scores for the current round
export const calculateRoundScore = () => {
  const bids = [];
  const tricksWon = [];
  const bonuses = [];
  let validationFailed = false;
  clearValidationMessage();

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
      setValidationMessage(
        `${player.name}'s tricks won must be between 0 and ${currentRound}.`
      );
      validationFailed = true;
      return;
    }

    if (bid < 0 || bid > currentRound) {
      setValidationMessage(
        `${player.name}'s bid must be between 0 and ${currentRound}.`
      );
      validationFailed = true;
      return;
    }

    if (bonus < 0) {
      setValidationMessage(`${player.name}'s bonus cannot be negative.`);
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
    setValidationMessage(
      `Total tricks won must equal ${currentRound} or ${currentRound - 1} for a Kraken round. You entered ${totalTricksWon}.`
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

  roundCalculated = true;

  renderRoundScores(players, currentRound);
  updateTotalScores(players);
  updateRoundProgressSummary();

  calculateRoundBtn.classList.add("hidden");

  if (currentRound === maxRounds) {
    alert("Game Over! Check the scores.");
    saveGameHistory(players); // Save completed game history
    clearActiveGame();
    nextRoundBtn.classList.add("hidden");
  } else {
    nextRoundBtn.classList.remove("hidden");
    persistActiveGame();
  }
};

// Move to the next round
export const nextRound = () => {
  currentRound++;
  if (currentRound <= maxRounds) {
    roundCalculated = false;
    updateRoundTitle();
    renderCurrentRoundInputs(players, currentRound, handleDraftInputsChanged);
    clearValidationMessage();
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
    updateRoundProgressSummary();
    persistActiveGame();
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
  roundCalculated = false;

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
  clearValidationMessage();
  clearActiveGame();
};
