# Technical Overview

Chess Buzz's central mechanism is the interplay between its content script and popup script.

---

## Content Script

The content script runs in the context of the page and has direct access to the page's DOM tree. It scrapes the page for information about the current chess position and sends that data back to the popup script. It also handles forwarding calls to either the Python backend or the popup script to simulate mouse actions.

---

## Popup Script

The popup script runs in the context of the popup window and therefore has no direct access to the page. It is responsible for:

- Syncing the UI with the current chess position
- Computing the next best move
- Simulating click actions

The popup script reads information passed from the content script, converts it into a FEN string, and passes that string to a JavaScript port of Stockfish for analysis. Once the next best move is calculated, it is displayed on the UI.

If autoplay is enabled, the move is sent back to the content script, where additional scraping is performed to convert the move into its corresponding XY coordinates. Click events are then orchestrated to simulate the move. The content script receives these click events and invokes the `chrome.debugger` API to simulate the clicks on the board.
