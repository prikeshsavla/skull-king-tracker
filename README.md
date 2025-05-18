# Skull King Score Tracker

A simple, mobile-friendly web application for tracking scores during games of Skull King. This app supports saving game history in your browser's local storage and caches player names for quick setup of new games.

## Features

- Track scores for 2-8 players over 10 rounds.
- Implements standard Skull King scoring rules (successful bids, unsuccessful bids, bidding zero, bonuses).
- Includes validation for "Tricks Won" input:
  - Individual players cannot win more tricks than the round number.
  - The total tricks won by all players must equal the round number or be one less (to account for the Kraken card in advanced play).
- Mobile-friendly responsive design using Tailwind CSS.
- Caches player names entered for easy selection in future games.
- Automatically saves completed game history (final scores with date and time) in local storage.
- Displays a history of past games with final scores.

## Technologies Used

- HTML5
- CSS3 (specifically Tailwind CSS via CDN)
- JavaScript (ES6 Modules for organization)

## Setup and Installation

This is a client-side web application, so no server-side setup is required.

1.  **Clone or Download:** Get the project files by cloning the repository or downloading the ZIP archive.
2.  **Place Files:** Save the `index.html`, `script.js`, `storage.js`, `ui.js`, `playerSetup.js`, `game.js`, and `history.js` files into the same directory on your computer.
3.  **Open in Browser:** Open the `index.html` file using a modern web browser (like Chrome, Firefox, Safari, Edge).

That's it! The application runs directly in your browser.

## How to Use

1.  **Player Setup:**
    - Enter player names one by one in the input field and click "Add Player".
    - If you've played before, you can click on cached player names to add them quickly.
    - Players currently added for the next game will appear in the "Players in New Game" list.
    - You can remove a player from the list by clicking the 'x' next to their name.
    - The "Start Game" button will become enabled once you have at least 2 players.
2.  **Starting a Game:**
    - Click the "Start Game" button when you have your players ready.
    - Click the "New Game" button at any time during a game to clear the current game and return to the player setup.
3.  **Playing a Round:**
    - The current round number is displayed at the top of the game area.
    - For each player, enter their bid, the number of tricks they actually won, and any bonus points.
    - Use the '+' and '-' buttons next to the input fields for quick adjustments.
    - Click "Calculate Round Score" to finalize the scores for the round. Validation will check if the tricks won are valid.
    - Click "Next Round" to proceed to the next round.
4.  **Viewing Scores:**
    - The main table displays the scores for each completed round.
    - The total scores for each player are shown at the bottom of the table.
5.  **Game Over:**
    - After completing Round 10, an alert will indicate the game is over.
    - The final scores will be automatically saved to the Game History.
6.  **Game History:**
    - The "Game History" section at the bottom of the page displays a list of all completed games saved in your browser's local storage, with the date/time and final scores.

## Game Rules

This app uses the standard Skull King rules, including basic scoring and bonus points for capturing specific cards (14s, Skull King by Mermaid, Pirates by Skull King, Mermaid by Pirate). The validation for total tricks won accounts for the Kraken card effect in the advanced version.

For detailed rules on how to play Skull King, please refer to the official rulebook or online guides.

## Future Enhancements (Optional)

- More detailed bonus point tracking (specific types of bonuses).
- Option to edit scores after calculation (with caution).
- Visual indication of who won the game in the history.
- Sorting options for the game history.
- Option to clear game history.
- A more visually engaging way to display the current round's inputs.

## License

This project is open-source and available under the [Specify License, e.g., MIT]. (Add a LICENSE file if you choose a specific license).
