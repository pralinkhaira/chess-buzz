![Chess Buzz Banner](https://raw.githubusercontent.com/pralinkhaira/chess-buzz/refs/heads/main/res/chessbuzz_banner_uppercase.png)
# Chess Buzz: AI-Powered Chess Assistant

**Chess Buzz** is a feature-rich browser extension that delivers real-time next-best-move analysis and intelligent autoplay capabilities for **Chess.com** and **Lichess**. Built for players who want powerful engine analysis paired with a polished, modern experience.

- Use wisely, you getting **banned** using this, isn't my headache!
- Use Leels Chess Zero, it replicates human like moves.

<p align="center">
  <img src="https://raw.githubusercontent.com/pralinkhaira/chess-buzz/refs/heads/main/res/chess.gif" align="center" height="500px" />
  <p align="center"><em>Chess Buzz defeating Maximum Bot (3200) in real-time</em></p>
</p>

## Update History

### Update V2: 24/02/2026 (Popup Multi-PV Redesign)

**Multi-PV Engine Display**

The popup UI has been completely redesigned to display multiple Principal Variations (PV) simultaneously, giving you deeper insight into the top engine lines instead of just a single move:

- **Ranked Variations**: The popup now computes and cleanly renders the top 4 engine lines stacked vertically.
- **Deep Move Limits**: Each variation displays exactly 3 full moves (6 plies) ahead.
- **Color-Coded Evaluations**: Scores are intelligently color-coded based on advantage (Red for Black, Blue for White, Green for Mate bounds).
- **Responsive Sizing**: The popup automatically scales horizontally to reveal the slide-out Quick Settings panel without overlapping the new horizontal PV listings.
- **Action Buttons Layout**: The main utility buttons (Analyze, Quick Set, Settings) have been re-stacked vertically on the right side with explicit text labels replacing touch-unfriendly tooltips.
<p align="center">
  <img width="1407" height="586" alt="image" src="https://github.com/user-attachments/assets/428f7c9a-b4dd-42ea-84e5-a468f9b0c3bf" />
  <p align="center"><em>HeatMap and Arrow Mode</em></p>
</p>

### Update V1: 23/02/2026 (Move Heatmap & Settings Polish)

**Move Heatmap & Visualization Modes**

A powerful new way to visualize engine analysis directly on the board:

- **Move Heatmap**: Highlights destination squares in **Green** (best/good — ≤0.5 pawn loss), **Yellow** (okay — 0.5–2.0 pawn loss), and **Red** (blunder — >2.0 pawn loss) based on engine evaluation.
- **Three Visualization Modes**:
  - **Arrows** — Classic directional arrows for the best lines.
  - **Heatmap** — Clean board overview showing the relative quality of each evaluated move.
  - **Both** — Heatmap squares rendered underneath arrows for maximum clarity.
- **Toggle Anywhere**: Switch visualization modes from either the **Quick Settings** panel (popup) or the **General Settings** page (book UI).
- **Responsive Analysis**: The heatmap updates dynamically as the engine calculates deeper depths.

> **Tip:** Set **Multiple Lines** to 3–5+ in Engine Advanced settings for the heatmap to show a meaningful spread of green, yellow, and red squares.
<p align="center">
  <img width="695" height="617" alt="image" src="https://github.com/user-attachments/assets/f67c25d6-4179-4ceb-8e1c-f7fed6afbe56" />
  <p align="center"><em>HeatMap and Arrow Mode</em></p>
</p>


**Settings Page Polish**

- **Unified typography**: All book-page content now uses a consistent `Crimson Pro` body font with `Playfair Display` reserved for headings and titles only.
- **Equal spacing**: All form sections (toggles, dropdowns, inputs, sliders) now have uniform 12px vertical gaps instead of the previous mix of 2px–40px.
- **Compact form elements**: Inputs, selects, range sliders, and buttons are constrained to 280px max-width so they no longer stretch edge-to-edge.
- **Tidier toggle rows**: Switch sections use flexbox for clean label-to-toggle alignment.
- **Cleaned up inline overrides**: Removed ad-hoc font-size, line-height, and margin inline styles from HTML in favour of the shared CSS system.

## What's New - Major Improvements

### Background & Origin

Chess Buzz started as a personal improvement project inspired by the work of **Alex Petrusca**. I came across his repository, appreciated the concept and its implementation, but noticed the project had gone largely inactive. I wanted to make changes tailored to my own workflow and usability preferences, so I picked it up and started iterating.

**Initial goals were modest:**
- Improve the UI for better clarity and comfort
- Refine certain interactions for smoother gameplay
- Fix minor bugs and edge-case issues I encountered personally

As I worked on it, the scope naturally expanded. What began as small tweaks evolved into a broader effort - redesigning the interface to feel more modern and minimal, optimizing performance in key areas, improving responsiveness, and cleaning up the codebase for long-term maintainability. The improvements listed below are the result of that gradual evolution.

<p align="center">
  <img src="https://raw.githubusercontent.com/pralinkhaira/chess-buzz/refs/heads/main/res/chessbuzz_stack_uppercase.png" align="center" height="500px" />
  <p align="center"><em>Chess Buzz</em></p>
</p>

### Complete UI Redesign - Modern & Distinctly Polished

The entire Options UI has been rebuilt from the ground up with a sophisticated dark glassmorphism aesthetic. Key highlights include:

- Animated floating background blobs for a dynamic, living feel
- Consistent **pink to purple gradient** accent system across all UI elements
- Modern typography powered by **Inter** and **Outfit** fonts
- Smooth **page transition animations** for a seamless navigation experience
- **Persistent dark/light mode** implemented via CSS variables

The extension now operates with a cohesive, premium visual identity with no generic framework defaults.

---

### Interactive Book-Themed Settings Experience

Traditional settings forms have been replaced with an **immersive 3D book interface**, making configuration feel like reading an actual book:

- CSS-only **page-turn animations** using `rotateY` transitions
- Realistic **parchment styling** with vintage-inspired typography
- **Chapter-based navigation** instead of flat form layouts
- Settings organized into five chapters:
  - *Engine Basics*
  - *Engine Advanced*
  - *Autoplay & UX*
  - *Autoplay Config*
- Built-in **Table of Contents** panel for quick chapter access

This transforms configuration into something genuinely enjoyable and visually distinct.

---

### Engine Strength Presets

A smart preset system simplifies engine configuration across different device capabilities:

| Preset | Engine Size | Threads | RAM |
|--------|-------------|---------|-----|
| **Low** | Small engine | 1 thread | 32 MB |
| **Medium** | Balanced | Half threads | 128 MB |
| **Max** | Full power | Max threads | 512 MB |
| **Custom** | Manual | User-defined | User-defined |

The system auto-detects when you deviate from a preset and switches to **Custom** mode automatically. A clear guidance section explains each tier so you always know what you're selecting.

---

### Popup Redesign + Slide-Out Quick Settings Panel

The popup has been rebuilt as a **modern control dashboard**:

- **Slide-out Quick Settings** panel that expands without overlapping main content
- Smooth **width expansion animation** with state persistence across reloads
- Improved evaluation display with **Score / Depth** shown cleanly and separately
- Cleaner connection and board detection status messages
- Compact, non-intrusive layout designed for real-time use

---

### Human Mode - Natural Autoplay Timing

A new **Human Mode** feature introduces weighted random delays during autoplay (0-18 seconds), biased toward shorter, more natural response times. This makes automated gameplay feel significantly more human-like.

- Available in both the **popup** and **full settings**
- State synced via `localStorage` for persistence across sessions

---

### Board & Piece Theme Controls

Customization is now more accessible than ever, directly from the popup:

- **13 board themes** with instant switching
- **14 piece themes** (engine reloads only when piece set changes)
- All selections persist across reloads

---

### Structural & Code Improvements

Under the hood, the codebase has been significantly cleaned up:

- CSS refactored to eliminate duplication, with shared book styles imported globally
- Original JS IDs preserved for full backward compatibility
- Improved layout stability using **flexbox**
- Fixed spacing, overflow, and alignment inconsistencies
- Evaluation display formatting improved for clarity

---

## Key Differentiators

What makes this version of Chess Buzz stand out:

- **Complete visual overhaul** with dark glassmorphism and a gradient accent system
- **Immersive book-themed** configuration experience with page-turn animations
- **Intelligent preset system** for engine strength tuning
- **Human Mode** for natural-feeling autoplay timing
- **Popup dashboard** redesign with a slide-out quick settings panel
- **Cleaner codebase** for better maintainability without sacrificing compatibility

---

## Getting Started

Click the Chess Buzz icon in your browser toolbar to open the popup. It will **automatically detect and analyze** the current chess position on the page.

To keep the popup pinned for easy access:
1. Click the puzzle-piece icon next to your browser's address bar.
2. Find **"Chess Buzz Chess Extension"** and click the **pin** icon.

> **Tip:** The popup closes when you click outside it. To keep it open during development, right-click the pinned icon and select **"Inspect Popup"**.

For a full walkthrough, visit the [Getting Started Guide](GETTING-STARTED.md).

Not sure which engine to use? See the [Chess Engine Selection Guide](ENGINE-SELECTION-GUIDE.md).

---

## Local Development Setup

**Install the extension locally:**
1. Clone this repository
2. Open `chrome://extensions` in Chrome
3. Enable **Developer Mode**
4. Click **"Load unpacked"** and select the cloned folder
5. Chess Buzz is now installed and active

**Test a code change:**
1. Navigate to `chrome://extensions`
2. Click **Reload** on the Chess Buzz extension
3. Reload the chess page you're testing on
4. Verify your changes

For deeper technical details, refer to the [Technical Overview](TECHNICAL-OVERVIEW.md).

---

## How to Add a New Engine Model

Adding a new engine involves 5 steps across 4 files.

### Step 1 - Add the engine files to `lib/engine/`

Create a new folder named after your engine and place the required files inside:

```
lib/engine/
  your-engine-name/
    your-engine.js       (the JS/WASM UCI-compatible wrapper)
    your-engine.wasm     (if WASM-based)
    your-model.nnue      (if NNUE-based)
```

### Step 2 - Register it in `popup.js` inside `engineMap`

```js
const engineMap = {
    'stockfish-17-nnue-79': 'stockfish-17-79/sf17-79.js',
    // ... existing engines ...
    'your-engine-name': 'your-engine-name/your-engine.js',  // add this
}
```

Then add it to the correct loading branch inside `initialize_engine()` based on how it loads:

- Plain JS Web Worker - add to the `new Worker()` branch
- Modern WASM via dynamic import - add to the `module.default()` branch
- NNUE model loading - name it with `nnue` in the key to trigger automatic model fetching
- iframe-based engine (like lc0) - follow the lc0 pattern

### Step 3 - Add the dropdown option in `popup.html`

```html
<select id="engine_select">
    <!-- existing options -->
    <option value="your-engine-name">Your Engine Display Name</option>
</select>
```

### Step 4 - Add the same option in the full Settings page

Add the identical `<option>` to the engine `<select>` in:

```
src/options/pages/settings/general/general.html
```

### Step 5 - Update `manifest.json` sandbox (iframe engines only)

Only needed if your engine loads inside an `<iframe>` (like lc0):

```json
"sandbox": {
  "pages": [
    "lib/engine/lc0/lc0.html",
    "lib/engine/your-engine-name/your-engine.html"
  ]
}
```

### Quick Reference

| What | Where |
|------|-------|
| Engine binary files | `lib/engine/your-engine-name/` |
| Engine key to path mapping | `popup.js` - `engineMap` object |
| Loading branch | `popup.js` - `initialize_engine()` |
| Popup dropdown option | `popup.html` - `#engine_select` |
| Full settings dropdown option | `general.html` - engine `<select>` |
| Sandbox entry (iframe only) | `manifest.json` - `"sandbox"` |

---

## How to Contribute

Contributions are always welcome! Here's how you can help:

- **Share ideas** - suggest features or UX improvements
- **Report bugs** - identify and document issues clearly
- **Submit PRs** - implement requested features or bug fixes
- **Improve documentation** - help keep the wiki and README up to date

Thank you for being a part of Chess Buzz!
