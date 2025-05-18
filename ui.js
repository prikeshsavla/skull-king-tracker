// ui.js

// Get DOM elements (these will be passed from script.js)
let playerListUl;
let cachedNamesButtonsDiv;
let noCachedNamesMessage;
let scoreTableHead;
let scoreTableBody;
let scoreTableFoot;
let currentRoundInputsDiv;
let historyTableHead;
let historyTableBody;

// Function to set DOM references
export const setUIReferences = (refs) => {
  playerListUl = refs.playerListUl;
  cachedNamesButtonsDiv = refs.cachedNamesButtonsDiv;
  noCachedNamesMessage = refs.noCachedNamesMessage;
  scoreTableHead = refs.scoreTableHead;
  scoreTableBody = refs.scoreTableBody;
  scoreTableFoot = refs.scoreTableFoot;
  currentRoundInputsDiv = refs.currentRoundInputsDiv;
  historyTableHead = refs.historyTableHead;
  historyTableBody = refs.historyTableBody;
};

// Render cached player name buttons
export const renderCachedNames = (cachedPlayers, addPlayerCallback) => {
  cachedNamesButtonsDiv.innerHTML = "";
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
      addPlayerCallback(name); // Use the callback to add player
    });
    cachedNamesButtonsDiv.appendChild(button);
  });
};

// Render the list of selected players for a new game
export const renderSelectedPlayers = (players, removePlayerCallback) => {
  playerListUl.innerHTML = "";
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
    removeBtn.addEventListener("click", () =>
      removePlayerCallback(player.name)
    ); // Use the callback
    li.appendChild(removeBtn);
    playerListUl.appendChild(li);
  });
};

// Render the main score table headers (player names)
export const renderScoreTableHeaders = (players) => {
  const headerRow = scoreTableHead.querySelector("tr");
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

  // Clear previous footer cells and add new ones based on players
  scoreTableFoot
    .querySelector("#round-score-row")
    .querySelectorAll("td:not(:first-child)")
    .forEach((td) => td.remove());
  scoreTableFoot
    .querySelector("#total-score-row")
    .querySelectorAll("td:not(:first-child)")
    .forEach((td) => td.remove());

  players.forEach(() => {
    const roundScoreTd = document.createElement("td");
    roundScoreTd.classList.add(
      "border",
      "border-gray-300",
      "p-2",
      "text-center"
    );
    roundScoreTd.textContent = "0";
    scoreTableFoot.querySelector("#round-score-row").appendChild(roundScoreTd);

    const totalScoreTd = document.createElement("td");
    totalScoreTd.classList.add(
      "border",
      "border-gray-300",
      "p-2",
      "text-center"
    );
    totalScoreTd.textContent = "0";
    scoreTableFoot.querySelector("#total-score-row").appendChild(totalScoreTd);
  });
};

// Render the current round's input fields for each player
export const renderCurrentRoundInputs = (
  players,
  currentRound,
  updateInputValueCallback
) => {
  currentRoundInputsDiv.innerHTML = "";

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
    const inputIds = ["bid", "tricks-won", "bonus"];

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
          input.value = Math.max(inputMins[fieldIndex], currentValue - 10);
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
          input.value = currentValue + 10;
        } else {
          const maxValue =
            inputMaxes[fieldIndex] !== null ? inputMaxes[fieldIndex] : Infinity;
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
// Render the scores for a completed round in the main table body
export const renderRoundScores = (players, roundNumber) => {
  const roundRow = document.createElement("tr");
  roundRow.classList.add("border-b", "border-gray-200");
  const roundCell = document.createElement("td");
  roundCell.classList.add("border", "border-gray-300", "p-2", "text-center");
  roundCell.textContent = roundNumber;
  roundRow.appendChild(roundCell);

  players.forEach((player) => {
    const scoreCell = document.createElement("td");
    scoreCell.classList.add("border", "border-gray-300", "p-2", "text-center");
    scoreCell.textContent = player.scores[roundNumber - 1]; // Get score for this specific round
    scoreCell.classList.add(
      player.scores[roundNumber - 1] < 0 ? "text-red-600" : "text-green-600"
    );
    roundRow.appendChild(scoreCell);
  });

  scoreTableBody.appendChild(roundRow);
};

// Update the total scores in the main table footer
export const updateTotalScores = (players) => {
  const totalScoreCells = scoreTableFoot
    .querySelector("#total-score-row")
    .querySelectorAll("td:not(:first-child)");
  players.forEach((player, index) => {
    totalScoreCells[index].textContent = player.totalScore;
  });
};

// Render the game history table
export const renderGameHistory = (gameHistory) => {
  const historyEntries = Object.entries(gameHistory).sort(([keyA], [keyB]) =>
    keyB.localeCompare(keyA)
  );

  historyTableBody.innerHTML = ""; // Clear previous history table body

  // Clear previous history table headers (except Date/Time)
  historyTableHead
    .querySelector("tr")
    .querySelectorAll("th:not(:first-child)")
    .forEach((th) => th.remove());

  if (historyEntries.length === 0) {
    const noHistoryRow = document.createElement("tr");
    noHistoryRow.innerHTML =
      '<td colspan="100%" class="border border-gray-300 p-2 text-center italic text-gray-600">No games played yet.</td>';
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

    // Custom Date Formatting
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
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    dateTimeCell.textContent = `${day} ${month} ${year} ${hours}:${formattedMinutes}${ampm}`;

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
      const playerInHistory = gameData.players.find((p) => p.name === name);
      if (playerInHistory) {
        scoreCell.textContent = playerInHistory.totalScore;
        scoreCell.classList.add(
          playerInHistory.totalScore < 0 ? "text-red-600" : "text-green-600"
        );
      } else {
        scoreCell.textContent = "-";
        scoreCell.classList.add("text-gray-500", "italic");
      }
      historyRow.appendChild(scoreCell);
    });

    historyTableBody.appendChild(historyRow);
  });
};
