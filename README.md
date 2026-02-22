![Chess Buzz Banner]

# Chess Buzz: AI-Powered Chess Assistant

**Chess Buzz** is a feature-rich browser extension that delivers real-time next-best-move analysis and intelligent autoplay capabilities for **Chess.com** and **Lichess**. Built for players who want powerful engine analysis paired with a polished, modern experience.

<p align="center">
  <img src="" align="center" height="500px" />
  <p align="center"><em>Chess Buzz defeating Maximum Bot (3200) in real-time</em></p>
</p>

---

## What's New - Major Improvements

### Background & Origin

Chess Buzz started as a personal improvement project inspired by the work of **Alex Petrusca**. I came across his repository, appreciated the concept and its implementation, but noticed the project had gone largely inactive. I wanted to make changes tailored to my own workflow and usability preferences, so I picked it up and started iterating.

**Initial goals were modest:**
- Improve the UI for better clarity and comfort
- Refine certain interactions for smoother gameplay
- Fix minor bugs and edge-case issues I encountered personally

As I worked on it, the scope naturally expanded. What began as small tweaks evolved into a broader effort - redesigning the interface to feel more modern and minimal, optimizing performance in key areas, improving responsiveness, and cleaning up the codebase for long-term maintainability. The improvements listed below are the result of that gradual evolution.

---

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

## How to Contribute

Contributions are always welcome! Here's how you can help:

- **Share ideas** - suggest features or UX improvements
- **Report bugs** - identify and document issues clearly
- **Submit PRs** - implement requested features or bug fixes
- **Improve documentation** - help keep the wiki and README up to date

Thank you for being a part of Chess Buzz!
