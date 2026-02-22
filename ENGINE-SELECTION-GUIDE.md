# Chess Engine Selection Guide

This guide explains which engine to choose and when.

---

## 1. Stockfish 17 NNUE – 79MB

**Best for:** Standard chess, maximum strength

**Use this if:**
- You want the strongest analysis
- You play serious games
- You prepare openings
- You analyze tournaments
- Your PC has decent RAM (4GB+ recommended)

**Why choose it?**
- Latest and strongest engine in the list
- Advanced NNUE neural network evaluation
- Fast and extremely accurate

> ✅ **Recommended default engine for most users.**

---

## 2. Stockfish 16 NNUE – 40MB

**Best for:** Slightly older systems

**Use this if:**
- Your system is low on storage
- You need a slightly lighter version
- You want stable performance on older CPUs

> Strength difference compared to Stockfish 17 is very small.

---

## 3. Stockfish 16 NNUE – 7MB

**Best for:** Very low-end systems

**Use this if:**
- You are on a very weak PC
- You want minimal storage usage
- You only need casual analysis

> ⚠️ **Note:** Weaker than the full NNUE versions.

---

## 4. Leela Chess Zero (Lc0 v0.19.1)

**Best for:** Human-like analysis (GPU recommended)

**Use this if:**
- You have a strong GPU
- You want positional and strategic style suggestions
- You are studying ideas rather than only best moves

**Important:**
- Slower on CPU-only systems
- Works best with GPU acceleration

---

## 5. Fairy Stockfish 14 NNUE

**Best for:** Chess variants

**Use this if you play:**
- 3check
- antichess
- atomic
- crazyhouse
- horde
- kingofthehill
- standard (nn)
- racingkings

> ❌ **Do not use for standard chess.**  
> Stockfish 17 is stronger for normal chess.

---

## 6. Stockfish 11 HCE / Stockfish 6

**Best for:** Testing or comparison only

**Use this if:**
- You want to compare modern vs old engines
- You want a weaker opponent

> Otherwise not recommended.

---

## 7. Remote Engine

**Best for:** Server-based analysis

**Use this if:**
- You connect to a powerful remote server
- You do not want to use local CPU

---

## Quick Decision Table

| Situation | Recommended Engine |
|---|---|
| Best overall strength | Stockfish 17 NNUE 79MB |
| Low-end PC | Stockfish 16 NNUE 7MB |
| GPU available | Leela Chess Zero |
| Chess variants | Fairy Stockfish |
| Weak practice opponent | Stockfish 11 or 6 |
| Cloud analysis | Remote Engine |

---

## Final Recommendation for Most Users

Set **Stockfish 17 NNUE – 79MB** as your default engine.

Switch only when:
- Playing variants → **Fairy Stockfish**
- Using GPU-based strategic engine → **Leela Chess Zero**
- On a very weak system → **Smaller Stockfish build**
