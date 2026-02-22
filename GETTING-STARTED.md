# Getting Started

## Usage

Clicking Chess Buzz's icon will open its popup window and automatically scrape the current page for a chess position to analyze.

---

## Pinning Chess Buzz

For ease of use, pin Chess Buzz in Chrome's extensions menu. Click the puzzle icon to the right of Chrome's address bar. Find **"Chess Buzz Chess Extension"** and click the pin icon to the right of it.

---

## Keeping Chess Buzz Open

You may notice that when you click outside of Chess Buzz's popup window, the popup will lose focus and close. To prevent this, right-click the pinned icon and click **"Inspect Popup"**.

> **Note:** This will keep the popup open until either the inspect window is closed or the current tab is changed or closed.

---

## Further Analysis

In Chess Buzz's popup window, you can click the button in the bottom-left corner to open the current position in Lichess's analysis board for in-depth analysis. This page will be opened in a new tab.

---

## Configuration

Chess Buzz supports several modes of operation.

### Best Move

This is the default mode. Chess Buzz presents the best move, the opponent's best response to the best move, and the Stockfish evaluation for the position. The best move is displayed as a blue arrow whereas the opponent's best response is displayed as a red arrow.

### Hand & Brain

Chess Buzz presents the Stockfish evaluation for the position and acts as the "Brain", telling you the type of piece to move. From there, it is your job as the "Hand" to find and play the best move given the hint.

### Autoplay

Chess Buzz calculates the next best move and simulates clicks to play it over the board. By default, the simulated clicks are generated directly in the browser.

### Python Autoplay Backend

Click and drag events are performed outside the browser from a Python backend. Simulated mouse actions are generated using PyAutoGUI. For this mode to work, users must run `mephisto-clicker.py` locally.

> **Note:** This script will take control of the mouse when activated by Chess Buzz.

### Puzzle Mode

Chess Buzz optimizes for efficiently solving and automating puzzles. This should be enabled when autoplaying puzzle minigames, such as Chess.com's Puzzle Rush and Lichess's Puzzle Storm, where a player's score depends on solving as many puzzles as possible in a fixed timeframe.
