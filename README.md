<div align="center">

# ⌨️ VeloType

### Typing Speed Test

**Type fast. Track progress. Beat your best.**

<p align="center">
  <a href="https://velo-type.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🔗_Live_Demo-velotype-F5C518?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Framer%20Motion-12-FF0050?style=flat-square&logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Recharts-3-22B5BF?style=flat-square" alt="Recharts" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
</p>

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Word Pool](#word-pool)
- [Keyboard Shortcuts](#keyboard-shortcuts)

---

## About

VeloType is a sleek, minimal typing speed test inspired by MonkeyType. Built for speed freaks who want a distraction-free experience with real-time WPM tracking, detailed post-test analytics and smooth animations.

All processing happens locally in the browser -no accounts, no servers, no tracking.

---

## Features

| Feature | Description |
|---------|-------------|
| **3 Test Modes** | Time (15/30/60/120s), Words (10/25/50/100) and Quote (short/medium/long) |
| **7 Languages** | English, Spanish, French, German, Portuguese, Italian and Hindi |
| **3,400+ Words** | Expanded word pools across all languages for varied tests |
| **35 Curated Quotes** | Real quotes across 3 length categories |
| **Real-time WPM** | Live words-per-minute calculation as you type |
| **Performance Chart** | Post-test graph with WPM curve, raw WPM and error markers |
| **Detailed Stats** | WPM, accuracy, raw WPM, consistency, character breakdown, elapsed time |
| **Punctuation & Numbers** | Toggle punctuation marks and random numbers into tests |
| **Sound Effects** | Mechanical keyboard sounds for typing, errors, space and backspace |
| **Smooth Animations** | Framer Motion transitions throughout the UI |
| **Local History** | Last 50 results saved in browser localStorage |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **UI Library** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Audio** | Web Audio API |
| **Fonts** | JetBrains Mono, Inter |

---

## Project Structure

```
velotype/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ModeBar.jsx          # Test mode selector navbar
│   │   ├── TypingArea.jsx       # Word display, caret, character coloring
│   │   ├── Timer.jsx            # Countdown / elapsed time display
│   │   └── Results.jsx          # Post-test stats + performance chart
│   ├── data/
│   │   ├── words.js             # 3,400+ words across 7 languages
│   │   └── quotes.js            # 35 curated quotes (short/medium/long)
│   ├── hooks/
│   │   ├── useTypingTest.js     # Core typing engine (state, WPM, history)
│   │   └── useSound.js          # Keyboard sound effects
│   ├── App.jsx                  # Main app layout + state management
│   ├── index.css                # Global styles, theme, animations
│   └── main.jsx                 # Entry point
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## Installation

### Prerequisites

- Node.js 18 or higher
- npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Mohit-Bagri/velotype.git
cd velotype

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Usage

### How It Works

Type the displayed words as fast and accurately as you can:

- **Correct characters** turn white
- **Wrong characters** turn red -backspace to fix
- **Extra characters** beyond word length show in faded red
- **Skipped characters** (pressing space early) count as errors
- **Missed words** in past lines get underlined in red

### Test Modes

| Mode | Options | How it Ends |
|------|---------|-------------|
| **Time** | 15s, 30s, 60s, 120s | Timer runs out |
| **Words** | 10, 25, 50, 100 | All words typed |
| **Quote** | Short, Medium, Long | Full quote typed |

### Post-Test Results

After the test completes you get:

| Stat | Description |
|------|-------------|
| **WPM** | Words per minute (correct characters / 5 / minutes) |
| **Accuracy** | Percentage of correct keystrokes |
| **Raw WPM** | Total characters / 5 / minutes (including errors) |
| **Consistency** | How steady your speed was throughout the test |
| **Characters** | Correct / Incorrect / Missed / Total |
| **Chart** | WPM over time with raw WPM overlay and error markers |

---

## Word Pool

| Language | Words |
|----------|-------|
| English | 1,089 |
| French | 421 |
| Hindi | 409 |
| German | 405 |
| Spanish | 391 |
| Italian | 366 |
| Portuguese | 343 |
| **Total** | **3,424** |

Every language includes common vocabulary plus extended everyday words. All languages support punctuation injection and random number insertion.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `esc` | Restart test |
| `tab` + `enter` | Restart test |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

<div align="center">

Made in 🇮🇳 with ❤️ by [Mohit Bagri](https://mohitbagri-portfolio.vercel.app)

⭐ **Star this repo if you found it helpful!** ⭐

</div>
