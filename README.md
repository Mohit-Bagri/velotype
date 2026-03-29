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
- [Test Modes](#test-modes)
- [Themes](#themes)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Word Pool](#word-pool)
- [Code Languages](#code-languages)
- [Keyboard Shortcuts](#keyboard-shortcuts)

---

## About

VeloType is a sleek, minimal typing speed test inspired by MonkeyType. Built for speed freaks who want a distraction-free experience with real-time WPM tracking, detailed post-test analytics and smooth animations.

All processing happens locally in the browser -- no accounts, no servers, no tracking.

---

## Features

| Feature | Description |
|---------|-------------|
| **6 Test Modes** | Time, Words, Quote, Zen, Custom Text and Code |
| **12 Languages** | English, Spanish, French, German, Portuguese, Italian, Hindi, Japanese, Korean, Arabic, Russian and Chinese |
| **16 Code Languages** | JavaScript, Python, TypeScript, Go, Rust, Java, C#, C++, Ruby, PHP, Swift, Kotlin, SQL, HTML, CSS and Bash |
| **9 Themes** | Dark, Light, Serika Dark, Serika Light, Nord, Dracula, Monokai, Ocean and Botanical |
| **4,400+ Words** | Expanded word pools across all 12 languages |
| **Word Difficulty** | Easy (common short words), Medium (full pool) and Hard (6+ character words) |
| **Smooth Caret** | Animated caret that glides between characters |
| **Live WPM** | Real-time words-per-minute counter while typing |
| **Performance Chart** | Post-test graph with WPM curve, raw WPM and error markers |
| **Detailed Stats** | WPM, accuracy, raw WPM, consistency, character breakdown |
| **History Page** | Track up to 200 tests with WPM/accuracy charts and pagination |
| **Punctuation & Numbers** | Toggle punctuation marks and random numbers |
| **Sound Effects** | Mechanical keyboard sounds for typing, errors, space and backspace |
| **Caps Lock Warning** | Instant detection with visual warning |
| **Anti-Cheat** | Detects inhuman keystroke speeds and flags suspicious results |
| **Custom Text** | Paste your own text to practice typing |
| **Zen Mode** | Infinite typing with no timer, press esc to end |
| **Responsive** | Works on desktop, tablet and mobile |
| **Accessible** | Keyboard navigation, ARIA roles, reduced motion support |

---

## Test Modes

| Mode | Description | How it Ends |
|------|-------------|-------------|
| **Time** | Type for 15, 30, 60 or 120 seconds | Timer runs out |
| **Words** | Type 10, 25, 50 or 100 words | All words typed |
| **Quote** | Type short, medium or long real quotes | Full quote typed |
| **Zen** | Type endlessly with no pressure | Press `esc` to end |
| **Custom** | Paste your own text to practice | All words typed |
| **Code** | Type real code snippets from 16 languages | Snippet completed |

---

## Themes

| Theme | Accent |
|-------|--------|
| Dark | Purple |
| Light | Purple |
| Serika Dark | Yellow |
| Serika Light | Yellow |
| Nord | Cyan |
| Dracula | Purple/Pink |
| Monokai | Pink |
| Ocean | Teal |
| Botanical | Green |

All themes are applied via CSS custom properties. Theme selection is persisted in localStorage.

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
│   │   ├── ModeBar.jsx            # Test mode selector navbar
│   │   ├── TypingArea.jsx         # Word display, smooth caret, character coloring
│   │   ├── Timer.jsx              # Countdown, elapsed time, live WPM
│   │   ├── Results.jsx            # Post-test stats + performance chart
│   │   ├── ThemePicker.jsx        # Theme selection dropdown
│   │   ├── CustomTextModal.jsx    # Custom text paste modal
│   │   └── History.jsx            # History page with charts + table
│   ├── data/
│   │   ├── words.js               # 3,400+ words across 12 languages
│   │   ├── quotes.js              # 100 curated quotes (short/medium/long)
│   │   └── codeSnippets.js        # 165+ code snippets for 16 languages
│   ├── hooks/
│   │   ├── useTypingTest.js       # Core typing engine (state, WPM, anti-cheat)
│   │   └── useSound.js            # Keyboard sound effects
│   ├── App.jsx                    # Main app layout + state management
│   ├── index.css                  # 9 themes, responsive styles, accessibility
│   └── main.jsx                   # Entry point
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
- **Wrong characters** turn red -- backspace to fix
- **Extra characters** beyond word length show in faded red
- **Skipped characters** (pressing space early) count as errors
- **Missed words** in past lines get underlined in red

### Post-Test Results

| Stat | Description |
|------|-------------|
| **WPM** | Words per minute (correct characters / 5 / minutes) |
| **Accuracy** | Percentage of correct keystrokes |
| **Raw WPM** | Total characters / 5 / minutes (including errors) |
| **Consistency** | How steady your speed was throughout the test |
| **Characters** | Correct / Incorrect / Missed / Total |
| **Chart** | WPM over time with raw WPM overlay and error markers |

### History

Click **History** in the top-right to view:

- Best WPM, Average WPM, Best Accuracy, Average Accuracy, Total Tests
- Performance chart showing WPM and accuracy trends over time
- Paginated table with WPM, raw WPM, accuracy, consistency, mode, language, duration and date
- Up to 200 tests stored locally in your browser

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
| Japanese (romaji) | ~200 |
| Korean (romanized) | ~200 |
| Chinese (pinyin) | ~200 |
| Arabic (romanized) | ~200 |
| Russian (romanized) | ~200 |
| **Total** | **~4,400** |

All languages support three difficulty levels: Easy (top 200 common words), Medium (full pool) and Hard (6+ character words).

### Quotes

| Length | Count | Example Authors |
|--------|-------|-----------------|
| Short | 55 | Einstein, Shakespeare, Twain, Tolkien, Socrates, Seneca, Lao Tzu |
| Medium | 30 | Roosevelt, Emerson, Thoreau, Mandela, Aurelius, Frankl |
| Long | 15 | MLK, Roosevelt, Thoreau, Camus, Williamson |
| **Total** | **100** | |

---

## Code Languages

| Language | Snippets |
|----------|----------|
| JavaScript | 20 |
| Python | 20 |
| TypeScript | 20 |
| Go | 20 |
| Rust | 20 |
| Java | 20 |
| C# | 20 |
| C++ | 20 |
| Ruby | 20 |
| PHP | 20 |
| Swift | 20 |
| Kotlin | 20 |
| SQL | 20 |
| HTML | 20 |
| CSS | 20 |
| Bash | 20 |
| **Total** | **165+** |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `esc` | Restart test (end session in Zen mode) |
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

## License

MIT License -- see [LICENSE](LICENSE)

---

<div align="center">

Made in 🇮🇳 with ❤️ by [Mohit Bagri](https://mohitbagri-portfolio.vercel.app)

⭐ **Star this repo if you found it helpful!** ⭐

</div>
