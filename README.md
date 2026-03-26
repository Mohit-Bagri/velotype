# VeloType

A sleek, minimal typing speed test built with React. Inspired by MonkeyType, designed for speed freaks who want a distraction-free experience.

```
 __   __        _         _____
 \ \ / /  ___  | |  ___  |_   _|  _  _   _ __   ___
  \ V /  / -_) | | / _ \   | |   | || | | '_ \ / -_)
   \_/   \___| |_| \___/   |_|    \_, | | .__/ \___|
                                  |__/  |_|
```

## Features

- **3 Test Modes** -- Time (15/30/60/120s), Words (10/25/50/100), and Quote (short/medium/long)
- **7 Languages** -- English, Spanish, French, German, Portuguese, Italian, Hindi
- **3,400+ Words** -- Expanded word pools across all 7 languages
- **35 Curated Quotes** -- Real quotes across 3 length categories
- **Real-time WPM Tracking** -- Live words-per-minute calculation as you type
- **Performance Chart** -- Post-test graph with WPM curve, raw WPM, and error markers
- **Detailed Stats** -- WPM, accuracy, raw WPM, consistency, character breakdown, elapsed time
- **Punctuation & Numbers** -- Toggle punctuation marks and random numbers into word tests
- **Sound Effects** -- Mechanical keyboard sounds for typing, errors, space, and backspace
- **Smooth Animations** -- Framer Motion transitions throughout the UI
- **Keyboard Shortcuts** -- `esc` to restart, `tab + enter` to reset

## Tech Stack

- **React 19** with Vite 8
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Recharts** for performance charts
- **JetBrains Mono** -- monospace font for the typing area

## Quick Start

```bash
git clone https://github.com/Mohit-Bagri/velotype.git
cd velotype
npm install
npm run dev
```

Opens at `http://localhost:5173`

## How It Works

Type the displayed words as fast and accurately as you can. The app tracks every keystroke in real-time:

- **Correct characters** turn white
- **Wrong characters** turn red
- **Extra characters** beyond word length show in faded red
- **Skipped characters** (pressing space early) count as errors
- **Missed words** in past lines get underlined in red

After the test completes, you get a full breakdown with a performance chart showing your WPM over time, error distribution, and detailed stats.

## Project Structure

```
src/
  components/
    ModeBar.jsx       # Test mode selector (time/words/quote, durations, toggles)
    TypingArea.jsx     # Word display, caret, character coloring
    Timer.jsx          # Countdown / elapsed time display
    Results.jsx        # Post-test stats + performance chart
  data/
    words.js           # Word pools for 7 languages + generation logic
    quotes.js          # 35 curated quotes (short/medium/long)
  hooks/
    useTypingTest.js   # Core typing engine (state, WPM calc, history)
    useSound.js        # Keyboard sound effects (Web Audio API)
  App.jsx              # Main app layout + state management
  index.css            # Global styles, theme, animations
```

## Word Pool

| Language   | Words |
|------------|-------|
| English    | 1,089 |
| Spanish    | 391   |
| French     | 421   |
| German     | 405   |
| Portuguese | 343   |
| Italian    | 366   |
| Hindi      | 409   |

Every language includes common vocabulary plus extended everyday words. All languages support punctuation and number injection.

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## License

MIT

---

Made by [Mohit Bagri](https://github.com/Mohit-Bagri)
