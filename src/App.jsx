import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import ModeBar from './components/ModeBar'
import Timer from './components/Timer'
import TypingArea from './components/TypingArea'
import Results from './components/Results'
import { useTypingTest } from './hooks/useTypingTest'
import { useSound } from './hooks/useSound'

const LOGO_LINES = [
  ' __   __        _         _____',
  String.raw` \ \ / /  ___  | |  ___  |_   _|  _  _   _ __   ___`,
  String.raw`  \ V /  / -_) | | / _ \   | |   | || | | '_ \ / -_)`,
  String.raw`   \_/   \___| |_| \___/   |_|    \_, | | .__/ \___|`,
  '                                  |__/  |_|',
]
const LOGO = LOGO_LINES.join('\n')

function App() {
  const [mode, setMode] = useState('time')
  const [duration, setDuration] = useState(15)
  const [wordCount, setWordCount] = useState(25)
  const [punctuation, setPunctuation] = useState(false)
  const [numbers, setNumbers] = useState(false)
  const [language, setLanguage] = useState('english')
  const [quoteLength, setQuoteLength] = useState('short')
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('velotype-sound') !== 'false'
  })

  const {
    words, currentWordIndex, currentCharIndex, typed,
    status, timeLeft, handleKeyDown, resetTest, getStats,
  } = useTypingTest({ mode, duration, wordCount, punctuation, numbers, language, quoteLength })

  const { playType, playError, playSpace, playBack } = useSound(soundEnabled)
  const [stats, setStats] = useState(null)
  const tabPressedRef = useRef(false)
  const showChrome = status !== 'running'

  useEffect(() => {
    if (status === 'finished') setStats(getStats())
    else setStats(null)
  }, [status, getStats])

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev
      localStorage.setItem('velotype-sound', String(next))
      return next
    })
  }, [])

  const handleKeyDownWithSound = useCallback((e) => {
    if (e.key === ' ') playSpace()
    else if (e.key === 'Backspace') playBack()
    else if (e.key.length === 1) {
      const w = words[currentWordIndex]
      if (w && e.key === w[currentCharIndex] && currentCharIndex < w.length) playType()
      else playError()
    }
    handleKeyDown(e)
  }, [handleKeyDown, playType, playError, playSpace, playBack, words, currentWordIndex, currentCharIndex])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Tab') { e.preventDefault(); tabPressedRef.current = true; setTimeout(() => { tabPressedRef.current = false }, 500); return }
      if (e.key === 'Enter' && tabPressedRef.current) { e.preventDefault(); tabPressedRef.current = false; resetTest(); return }
      if (e.key === 'Escape') { e.preventDefault(); resetTest() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [resetTest])

  useEffect(() => {
    if (stats) {
      const h = JSON.parse(localStorage.getItem('velotype-history') || '[]')
      h.push({ wpm: stats.wpm, accuracy: stats.accuracy, duration: stats.elapsedSeconds, mode, language, date: new Date().toISOString() })
      if (h.length > 50) h.shift()
      localStorage.setItem('velotype-history', JSON.stringify(h))
    }
  }, [stats, mode, language])

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="w-full max-w-[1000px]">

          {/* Logo */}
          <motion.div
            animate={{ opacity: showChrome ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex justify-center mb-6"
          >
            <pre className="ascii-glow select-none text-left">{LOGO}</pre>
          </motion.div>

          {/* Navbar */}
          <ModeBar
            mode={mode} setMode={setMode}
            duration={duration} setDuration={setDuration}
            wordCount={wordCount} setWordCount={setWordCount}
            punctuation={punctuation} setPunctuation={setPunctuation}
            numbers={numbers} setNumbers={setNumbers}
            language={language} setLanguage={setLanguage}
            quoteLength={quoteLength} setQuoteLength={setQuoteLength}
            visible={showChrome}
            disabled={status === 'running'}
            onReset={resetTest}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />

          {/* Content */}
          {status !== 'finished' ? (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
              <Timer timeLeft={timeLeft} status={status} mode={mode} />
              <TypingArea
                words={words}
                currentWordIndex={currentWordIndex}
                currentCharIndex={currentCharIndex}
                typed={typed}
                status={status}
                onKeyDown={handleKeyDownWithSound}
              />
              {/* Tip below typing area */}
              <motion.div
                animate={{ opacity: status === 'idle' ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-center mt-10"
                style={{ pointerEvents: 'none' }}
              >
                <span className="tip-glow text-[11px] tracking-wider">
                  <kbd className="glass rounded px-1.5 py-0.5 text-[10px] mx-0.5">esc</kbd>
                  <span className="ml-1.5">— restart test</span>
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Results stats={stats} duration={stats?.elapsedSeconds || duration} mode={mode} language={language} punctuation={punctuation} numbers={numbers} wordCount={wordCount} />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
