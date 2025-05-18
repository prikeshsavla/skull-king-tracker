// script.js

document.addEventListener("DOMContentLoaded", () => {
  const playerSetupDiv = document.getElementById("player-setup");
  const gameAreaDiv = document.getElementById("game-area");
  const cachedNamesButtonsDiv = document.getElementById("cached-names-buttons");
  const noCachedNamesMessage = document.getElementById("no-cached-names");
  const selectedPlayersDiv = document.getElementById("selected-players");
  const playerListUl = document.getElementById("player-list");
  const newPlayerNameInput = document.getElementById("new-player-name");
  const addPlayerBtn = document.getElementById("add-player-btn");
  const startGameBtn = document.getElementById("start-game-btn");
  // const loadGameBtn = document.getElementById('load-game-btn'); // Removed
  const scoreTable = document.getElementById("score-table");
  const scoreTableHead = scoreTable.querySelector("thead");
  const scoreTableBody = document.getElementById("score-table-body");
  const scoreTableFoot = document.getElementById("score-table-foot");
  const currentRoundTitle = document.getElementById("current-round-title");
  const currentRoundInputsDiv = document.getElementById("current-round-inputs");
  const calculateRoundBtn = document.getElementById("calculate-round-btn");
  const nextRoundBtn = document.getElementById("next-round-btn");
  const newGameBtn = document.getElementById("new-game-btn");
  const historyTable = document.getElementById("history-table"); // New reference
  const historyTableHead = historyTable.querySelector("thead"); // New reference
  const historyTableBody = document.getElementById("history-table-body"); // New reference

  let players = [];
  let currentRound = 1;
  const maxRounds = 10; // Skull King is played over 10 rounds

  // --- Local Storage Keys ---
  const CACHED_PLAYERS_STORAGE_KEY = "skullKingCachedPlayers";
  const GAME_HISTORY_STORAGE_KEY = "skullKingGameHistory"; // New key for history

  // --- Helper Functions ---

  // Save data to local storage
  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to local storage:", e);
    }
  };

  // Load data from local storage
  const loadFromLocalStorage = (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error loading from local storage:", e);
      return null;
    }
  };

  // Update cached player names
  const updateCachedPlayers = (playerName) => {
    let cachedPlayers = loadFromLocalStorage(CACHED_PLAYERS_STORAGE_KEY) || [];
    if (!cachedPlayers.includes(playerName)) {
      cachedPlayers.push(playerName);
      saveToLocalStorage(CACHED_PLAYERS_STORAGE_KEY, cachedPlayers);
    }
    renderCachedNames();
  };

  // Render cached player name buttons
  const renderCachedNames = () => {
    const cachedPlayers =
      loadFromLocalStorage(CACHED_PLAYERS_STORAGE_KEY) || [];
    cachedNamesButtonsDiv.innerHTML = ""; // Clear previous buttons
    if (cachedPlayers.length === 0) {
      noCachedNamesMessage.classList.remove("hidden");
      return;
    }
    noCachedNamesMessage.classList.add("hidden");
    cachedPlayers.forEach((name) => {
      const button = document.createElement("button");
      button.textContent = name;
      button.classList.add(
        "px-3",
        "py-1",
        "bg-gray-600",
        "text-white",
        "rounded-md",
        "hover:bg-gray-700",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-gray-500",
        "text-sm"
      );
      button.addEventListener("click", () => {
        addPlayer(name);
      });
      cachedNamesButtonsDiv.appendChild(button);
    });
  };

  // Add a player to the setup list and update display
  const addPlayer = (name) => {
    const playerName = name || newPlayerNameInput.value.trim();
    if (playerName && !players.some((p) => p.name === playerName)) {
      players.push({ name: playerName, scores: [], totalScore: 0 });
      newPlayerNameInput.value = ""; // Clear input
      renderSelectedPlayers(); // Update the display of added players
      updateCachedPlayers(playerName); // Add to cache
    } else if (playerName && players.some((p) => p.name === playerName)) {
      alert("Player with this name already added!");
    } else {
      alert("Please enter a player name.");
    }
    renderPlayerSetup(); // Update start button state
  };

  // Render the list of selected players
  const renderSelectedPlayers = () => {
    playerListUl.innerHTML = ""; // Clear the current list
    if (players.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No players added yet.";
      li.classList.add("text-gray-600", "italic");
      playerListUl.appendChild(li);
      return;
    }
    players.forEach((player) => {
      const li = document.createElement("li");
      li.classList.add(
        "bg-gray-200",
        "px-3",
        "py-1",
        "rounded-md",
        "text-sm",
        "flex",
        "items-center"
      );

      const playerNameSpan = document.createElement("span");
      playerNameSpan.textContent = player.name;
      playerNameSpan.classList.add("mr-2");
      li.appendChild(playerNameSpan);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "x";
      removeBtn.classList.add(
        "ml-auto",
        "text-red-600",
        "hover:text-red-800",
        "font-bold",
        "leading-none",
        "focus:outline-none"
      );
      removeBtn.addEventListener("click", () => removePlayer(player.name));

      li.appendChild(removeBtn);
      playerListUl.appendChild(li);
    });
  };

  // Remove a player from the setup list
  const removePlayer = (nameToRemove) => {
    players = players.filter((player) => player.name !== nameToRemove);
    renderSelectedPlayers(); // Re-render the list of players
    renderPlayerSetup(); // Update the start game button state (requires at least 2 players)
  };

  // Update the player setup section state
  const renderPlayerSetup = () => {
    startGameBtn.disabled = players.length < 2; // Need at least 2 players
    // loadGameBtn.disabled = !loadFromLocalStorage(LAST_GAME_STORAGE_KEY); // Removed
  };

  // --- Game Initialization and Setup ---

  const initializeGame = () => {
    playerSetupDiv.classList.add("hidden");
    gameAreaDiv.classList.remove("hidden");
    currentRound = 1;
    renderScoreTableHeaders();
    renderCurrentRoundInputs();
    updateRoundTitle();
    calculateRoundBtn.classList.remove("hidden");
    nextRoundBtn.classList.add("hidden");
    scoreTableBody.innerHTML = ""; // Ensure body is clear for new game
    // Clear footer scores
    scoreTableFoot
      .querySelector("#round-score-row")
      .querySelectorAll("td:not(:first-child)")
      .forEach((td) => td.remove());
    scoreTableFoot
      .querySelector("#total-score-row")
      .querySelectorAll("td:not(:first-child)")
      .forEach((td) => td.remove());

    // Add initial footer cells
    players.forEach(() => {
      const roundScoreTd = document.createElement("td");
      roundScoreTd.classList.add(
        "border",
        "border-gray-300",
        "p-2",
        "text-center"
      );
      roundScoreTd.textContent = "0"; // Initial round score
      scoreTableFoot
        .querySelector("#round-score-row")
        .appendChild(roundScoreTd);

      const totalScoreTd = document.createElement("td");
      totalScoreTd.classList.add(
        "border",
        "border-gray-300",
        "p-2",
        "text-center"
      );
      totalScoreTd.textContent = "0"; // Initial total score
      scoreTableFoot
        .querySelector("#total-score-row")
        .appendChild(totalScoreTd);
    });
  };

  const renderScoreTableHeaders = () => {
    const headerRow = scoreTableHead.querySelector("tr");
    // Remove existing player headers except the first 'Round' header
    headerRow
      .querySelectorAll("th:not(:first-child)")
      .forEach((th) => th.remove());

    players.forEach((player) => {
      const th = document.createElement("th");
      th.classList.add(
        "border",
        "border-gray-300",
        "p-2",
        "bg-blue-600",
        "text-white",
        "text-center"
      );
      th.textContent = player.name;
      headerRow.appendChild(th);
    });
    // Input rows (bid, tricks, bonus) are now handled in renderCurrentRoundInputs
  };

  // --- Render Current Round Inputs ---
  const renderCurrentRoundInputs = () => {
    currentRoundInputsDiv.innerHTML = ""; // Clear previous inputs

    players.forEach((player, index) => {
      const playerInputBlock = document.createElement("div");
      playerInputBlock.classList.add(
        "mb-4",
        "p-4",
        "border",
        "border-gray-300",
        "rounded-md",
        "bg-gray-50"
      );

      const playerNameHeader = document.createElement("h3");
      playerNameHeader.classList.add(
        "text-lg",
        "font-bold",
        "text-blue-700",
        "mb-3",
        "border-b",
        "border-gray-300",
        "pb-2"
      );
      playerNameHeader.textContent = player.name;
      playerInputBlock.appendChild(playerNameHeader);

      // Input fields with labels and steppers
      const inputFields = ["Bid", "Tricks Won", "Bonus"];
      const inputTypes = ["number", "number", "number"];
      const inputMins = [0, 0, 0];
      const inputMaxes = [currentRound, currentRound, null];
      const inputIds = ["bid", "tricks-won", "bonus"]; // Base IDs for generating unique IDs

      inputFields.forEach((labelText, fieldIndex) => {
        const inputDiv = document.createElement("div");
        inputDiv.classList.add("flex", "items-center", "mb-2");

        const label = document.createElement("label");
        label.classList.add("w-28", "font-semibold", "text-gray-700");
        label.textContent = labelText + ":";
        inputDiv.appendChild(label);

        const input = document.createElement("input");
        input.type = inputTypes[fieldIndex];
        input.value = 0;
        input.min = inputMins[fieldIndex];
        if (inputMaxes[fieldIndex] !== null) {
          input.max = inputMaxes[fieldIndex];
        }
        input.id = `${inputIds[fieldIndex]}-input-player-${index}`;

        input.classList.add(
          "w-16",
          "p-1",
          "border",
          "border-gray-300",
          "rounded-md",
          "text-center",
          "mr-2",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-blue-500"
        );

        // Stepper Buttons
        const stepperDown = document.createElement("button");
        stepperDown.textContent = "-";
        stepperDown.classList.add(
          "px-2",
          "py-1",
          "bg-gray-300",
          "rounded-md",
          "hover:bg-gray-400",
          "focus:outline-none"
        );
        stepperDown.addEventListener("click", () => {
          const currentValue = parseInt(input.value) || 0;
          if (labelText === "Bonus") {
            input.value = Math.max(inputMins[fieldIndex], currentValue - 10); // Adjust bonus by 10s
          } else {
            input.value = Math.max(inputMins[fieldIndex], currentValue - 1);
          }
        });

        const stepperUp = document.createElement("button");
        stepperUp.textContent = "+";
        stepperUp.classList.add(
          "px-2",
          "py-1",
          "bg-gray-300",
          "rounded-md",
          "hover:bg-gray-400",
          "focus:outline-none",
          "ml-1"
        );
        stepperUp.addEventListener("click", () => {
          const currentValue = parseInt(input.value) || 0;
          if (labelText === "Bonus") {
            input.value = currentValue + 10; // Adjust bonus by 10s
          } else {
            const maxValue =
              inputMaxes[fieldIndex] !== null
                ? inputMaxes[fieldIndex]
                : Infinity;
            input.value = Math.min(maxValue, currentValue + 1);
          }
        });

        inputDiv.appendChild(input);
        inputDiv.appendChild(stepperDown);
        inputDiv.appendChild(stepperUp);
        playerInputBlock.appendChild(inputDiv);
      });

      currentRoundInputsDiv.appendChild(playerInputBlock);
    });
  };

  const updateRoundTitle = () => {
    currentRoundTitle.textContent = `Round ${currentRound}`;
  };

  // --- Scoring Logic ---

  const calculateRoundScore = () => {
    const bids = [];
    const tricksWon = [];
    const bonuses = [];
    let validationFailed = false; // Flag to track validation

    // Loop through players by index to get values using unique IDs
    players.forEach((player, index) => {
      if (validationFailed) return; // Skip if validation already failed from previous checks

      const bidInput = document.getElementById(`bid-input-player-${index}`);
      const tricksInput = document.getElementById(
        `tricks-won-input-player-${index}`
      );
      const bonusInput = document.getElementById(`bonus-input-player-${index}`);

      const won = parseInt(tricksInput.value) || 0;
      const bid = parseInt(bidInput.value) || 0;
      const bonus = parseInt(bonusInput.value) || 0;

      // --- Individual Player Tricks Won Validation ---
      if (won > currentRound) {
        alert(
          `Error: ${player.name} cannot win more than ${currentRound} tricks in Round ${currentRound}. Please correct the 'Tricks Won' value.`
        );
        validationFailed = true; // Set flag
        return; // Skip current iteration
      }
      // --- End Individual Player Tricks Won Validation ---

      bids.push(bid);
      tricksWon.push(won);
      bonuses.push(bonus);
    });

    // --- Stop if individual validation failed ---
    if (validationFailed) {
      return; // Exit the function
    }
    // --- End Stop if individual validation failed ---

    // --- Total Tricks Won Validation ---
    const totalTricksWon = tricksWon.reduce((sum, current) => sum + current, 0); // Calculate sum of tricks won
    if (totalTricksWon !== currentRound) {
      // Check if total tricks won equals the round number
      alert(
        `Error: The total number of tricks won (${totalTricksWon}) must equal the round number (${currentRound}). Please adjust the 'Tricks Won' values.`
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
        // Successful bid
        if (bid === 0) {
          // Bid 0 and won 0
          score = currentRound * 10;
        } else {
          // Bid X and won X (X > 0)
          score = bid * 20;
        }
        // Add bonus points if bid was successful
        score += bonus;
      } else {
        // Unsuccessful bid
        if (bid === 0) {
          // Bid 0 and won > 0
          score = currentRound * -10;
        } else {
          // Bid X and won Y (X != Y, X > 0)
          score = Math.abs(bid - won) * -10;
        }
        // No bonus points for unsuccessful bid (handled by structure)
      }

      return score;
    });

    console.log("Round Scores:", roundScores);
    console.log("---------------------------------------------");

    // Update the round scores in the footer
    const roundScoreCells = scoreTableFoot
      .querySelector("#round-score-row")
      .querySelectorAll("td:not(:first-child)");
    roundScoreCells.forEach((cell, index) => {
      cell.textContent = roundScores[index];
    });

    // Update total scores and render the scores in the body
    const totalScoreCells = scoreTableFoot
      .querySelector("#total-score-row")
      .querySelectorAll("td:not(:first-child)");
    players.forEach((player, index) => {
      player.scores.push(roundScores[index]);
      player.totalScore += roundScores[index];
      totalScoreCells[index].textContent = player.totalScore;
    });

    renderRoundScores(); // Add a row to the body with the scores
    calculateRoundBtn.classList.add("hidden");

    if (currentRound === maxRounds) {
      // Game over - save to history and maybe display winner
      alert("Game Over! Check the scores.");
      saveGameHistory(); // Save the completed game to history
      nextRoundBtn.classList.add("hidden"); // Ensure next round button is hidden
      // Optional: Display winner here
    } else {
      nextRoundBtn.classList.remove("hidden");
    }
  };

  const renderRoundScores = () => {
    const roundRow = document.createElement("tr");
    roundRow.classList.add("border-b", "border-gray-200");
    const roundCell = document.createElement("td");
    roundCell.classList.add("border", "border-gray-300", "p-2", "text-center");
    roundCell.textContent = currentRound;
    roundRow.appendChild(roundCell);

    players.forEach((player) => {
      const scoreCell = document.createElement("td");
      scoreCell.classList.add(
        "border",
        "border-gray-300",
        "p-2",
        "text-center"
      );
      // Get the last added score (the score for the current round)
      scoreCell.textContent = player.scores[player.scores.length - 1];
      scoreCell.classList.add(
        player.scores[player.scores.length - 1] < 0
          ? "text-red-600"
          : "text-green-600"
      ); // Color negative scores
      roundRow.appendChild(scoreCell);
    });

    scoreTableBody.appendChild(roundRow);
  };

  // --- Game History Management ---

  // Save completed game to history
  const saveGameHistory = () => {
    const gameHistory = loadFromLocalStorage(GAME_HISTORY_STORAGE_KEY) || {};
    const timestamp = new Date().toISOString(); // Use ISO string for consistent key format
    gameHistory[timestamp] = {
      players: players.map((player) => ({
        // Save a snapshot of players with final scores
        name: player.name,
        totalScore: player.totalScore,
      })),
    };
    saveToLocalStorage(GAME_HISTORY_STORAGE_KEY, gameHistory);
    renderGameHistory(); // Update the history display
  };

  // Render the game history table
  // Render the game history table
  const renderGameHistory = () => {
    const gameHistory = loadFromLocalStorage(GAME_HISTORY_STORAGE_KEY) || {};
    const historyEntries = Object.entries(gameHistory).sort(([keyA], [keyB]) =>
      keyB.localeCompare(keyA)
    ); // Get entries and sort by timestamp descending

    // Clear previous history table body
    historyTableBody.innerHTML = "";

    // Clear previous history table headers (except Date/Time)
    historyTableHead
      .querySelector("tr")
      .querySelectorAll("th:not(:first-child)")
      .forEach((th) => th.remove());

    if (historyEntries.length === 0) {
      const noHistoryRow = document.createElement("tr");
      noHistoryRow.innerHTML =
        '<td colspan="100%" class="border border-gray-300 p-2 text-center italic text-gray-600">No games played yet.</td>'; // Use a high colspan
      historyTableBody.appendChild(noHistoryRow);
      return;
    }

    // Determine all unique player names across history to create headers
    const allPlayerNames = new Set();
    historyEntries.forEach(([timestamp, gameData]) => {
      gameData.players.forEach((player) => allPlayerNames.add(player.name));
    });

    // Add player name headers to history table
    const historyHeaderRow = historyTableHead.querySelector("tr");
    allPlayerNames.forEach((name) => {
      const th = document.createElement("th");
      th.classList.add(
        "border",
        "border-gray-300",
        "p-2",
        "bg-gray-600",
        "text-white",
        "text-center"
      );
      th.textContent = name;
      historyHeaderRow.appendChild(th);
    });

    // Populate history table body
    historyEntries.forEach(([timestamp, gameData]) => {
      const historyRow = document.createElement("tr");
      historyRow.classList.add("border-b", "border-gray-200");

      const dateTimeCell = document.createElement("td");
      dateTimeCell.classList.add(
        "border",
        "border-gray-300",
        "p-2",
        "text-center"
      );

      // --- Custom Date Formatting ---
      const date = new Date(timestamp);
      const day = date.getDate();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

      dateTimeCell.textContent = `${day} ${month} ${year} ${hours}:${formattedMinutes}${ampm}`;
      // --- End Custom Date Formatting ---

      historyRow.appendChild(dateTimeCell);

      // Add score cells for each player in the history header order
      allPlayerNames.forEach((name) => {
        const scoreCell = document.createElement("td");
        scoreCell.classList.add(
          "border",
          "border-gray-300",
          "p-2",
          "text-center"
        );
        // Find the player's score in this game's data
        const playerInHistory = gameData.players.find((p) => p.name === name);
        if (playerInHistory) {
          scoreCell.textContent = playerInHistory.totalScore;
          scoreCell.classList.add(
            playerInHistory.totalScore < 0 ? "text-red-600" : "text-green-600"
          );
        } else {
          scoreCell.textContent = "-"; // Player didn't play in this game
          scoreCell.classList.add("text-gray-500", "italic");
        }
        historyRow.appendChild(scoreCell);
      });

      historyTableBody.appendChild(historyRow);
    });
  };

  const startNewGame = () => {
    if (
      confirm(
        "Are you sure you want to start a new game? This will clear the current game."
      )
    ) {
      players = [];
      currentRound = 1;
      scoreTableBody.innerHTML = ""; // Clear table body
      currentRoundInputsDiv.innerHTML = ""; // Clear current round inputs
      // Clear footer scores
      scoreTableFoot
        .querySelector("#round-score-row")
        .querySelectorAll("td:not(:first-child)")
        .forEach((td) => td.remove());
      scoreTableFoot
        .querySelector("#total-score-row")
        .querySelectorAll("td:not(:first-child)")
        .forEach((td) => td.remove());
      playerSetupDiv.classList.remove("hidden");
      gameAreaDiv.classList.add("hidden");
      newPlayerNameInput.value = "";
      renderSelectedPlayers(); // Clear and update selected players display
      renderPlayerSetup(); // Reset player setup state
      // localStorage.removeItem(LAST_GAME_STORAGE_KEY); // Removed - we don't save unfinished games anymore
    }
  };

  // --- Event Listeners ---

  addPlayerBtn.addEventListener("click", () => addPlayer());

  newPlayerNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addPlayer();
    }
  });

  startGameBtn.addEventListener("click", () => {
    if (players.length >= 2) {
      // When starting a new game, clear the current players' scores
      players.forEach((player) => {
        player.scores = [];
        player.totalScore = 0;
      });
      initializeGame();
    } else {
      alert("You need at least 2 players to start.");
    }
  });

  // loadGameBtn.addEventListener('click', loadGameState); // Removed

  calculateRoundBtn.addEventListener("click", calculateRoundScore);

  nextRoundBtn.addEventListener("click", () => {
    currentRound++;
    if (currentRound <= maxRounds) {
      updateRoundTitle();
      renderCurrentRoundInputs(); // Render inputs for the new round
      renderScoreTableHeaders(); // Update table headers (keeps player names in sync)
      calculateRoundBtn.classList.remove("hidden");
      nextRoundBtn.classList.add("hidden");
      // Clear round score in footer
      scoreTableFoot
        .querySelector("#round-score-row")
        .querySelectorAll("td:not(:first-child)")
        .forEach((td) => (td.textContent = "0"));
      // No need to save ongoing game state with LAST_GAME_STORAGE_KEY anymore
    } else {
      // Should not happen if nextRoundBtn is hidden after round 10
      alert("Game finished!");
      nextRoundBtn.classList.add("hidden");
    }
  });

  newGameBtn.addEventListener("click", startNewGame);

  // --- Initial Load ---
  renderCachedNames(); // Display cached names on page load
  renderSelectedPlayers(); // Display the initially empty selected players list
  renderPlayerSetup(); // Check if game can be started
  renderGameHistory(); // Load and display game history on page load
});
