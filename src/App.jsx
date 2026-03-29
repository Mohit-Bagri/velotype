import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import ModeBar from './components/ModeBar'
import Timer from './components/Timer'
import TypingArea from './components/TypingArea'
import Results from './components/Results'
import ThemePicker from './components/ThemePicker'
import CustomTextModal from './components/CustomTextModal'
import History from './components/History'
import { useTypingTest } from './hooks/useTypingTest'
import { useSound } from './hooks/useSound'

const LOGO = [
  '██╗   ██╗███████╗██╗      ██████╗ ████████╗██╗   ██╗██████╗ ███████╗',
  '██║   ██║██╔════╝██║     ██╔═══██╗╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝',
  '██║   ██║█████╗  ██║     ██║   ██║   ██║    ╚████╔╝ ██████╔╝█████╗',
  '╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝',
  ' ╚████╔╝ ███████╗███████╗╚██████╔╝   ██║      ██║   ██║     ███████╗',
  '  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝    ╚═╝      ╚═╝   ╚═╝     ╚══════╝',
].join('\n')

function App() {
  const [mode, setMode] = useState('time')
  const [duration, setDuration] = useState(15)
  const [wordCount, setWordCount] = useState(25)
  const [punctuation, setPunctuation] = useState(false)
  const [numbers, setNumbers] = useState(false)
  const [language, setLanguage] = useState('english')
  const [quoteLength, setQuoteLength] = useState('short')
  const [difficulty, setDifficulty] = useState('medium')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [customWords, setCustomWords] = useState(null)
  const [customTextOpen, setCustomTextOpen] = useState(false)
  const [view, setView] = useState('test') // 'test' | 'history'
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('velotype-sound') !== 'false'
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('velotype-theme') || 'dark'
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('velotype-theme', theme)
  }, [theme])

  const {
    words, currentWordIndex, currentCharIndex, typed,
    status, timeLeft, liveWpm, elapsedTime,
    handleKeyDown, resetTest, getStats, finishZen,
  } = useTypingTest({ mode, duration, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords })

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
      if (e.key === 'Escape') {
        e.preventDefault()
        if (mode === 'zen' && status === 'running') { finishZen(); return }
        resetTest()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [resetTest, finishZen, mode, status])

  useEffect(() => {
    if (stats && !stats.suspicious) {
      const h = JSON.parse(localStorage.getItem('velotype-history') || '[]')
      h.push({ wpm: stats.wpm, rawWpm: stats.rawWpm, accuracy: stats.accuracy, consistency: stats.consistency, duration: stats.elapsedSeconds, mode, language, difficulty, date: new Date().toISOString() })
      if (h.length > 200) h.shift()
      localStorage.setItem('velotype-history', JSON.stringify(h))
    }
  }, [stats, mode, language])

  const handleSetMode = useCallback((m) => {
    if (m === 'custom') {
      setCustomTextOpen(true)
      return
    }
    setCustomWords(null)
    setMode(m)
  }, [])

  const handleCustomSubmit = useCallback((words) => {
    setCustomWords(words)
    setMode('custom')
  }, [])

  if (view === 'history') {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="fixed top-5 right-5 z-50">
          <ThemePicker current={theme} onChange={setTheme} />
        </div>
        <main className="flex flex-1 flex-col items-center justify-start px-8 pt-16">
          <History onBack={() => setView('test')} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top right controls */}
      <div className="fixed top-5 right-5 z-50 flex items-center gap-3">
        <button
          onClick={() => setView('history')}
          className="text-[12px] cursor-pointer transition-colors px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--t-sub)', border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.borderColor = 'var(--t-glass-border)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--t-sub)'; e.currentTarget.style.borderColor = 'transparent' }}
        >
          History
        </button>
        <ThemePicker current={theme} onChange={setTheme} />
      </div>

      {/* Custom text modal */}
      <CustomTextModal open={customTextOpen} onClose={() => setCustomTextOpen(false)} onSubmit={handleCustomSubmit} />

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
            mode={mode} setMode={handleSetMode}
            duration={duration} setDuration={setDuration}
            wordCount={wordCount} setWordCount={setWordCount}
            punctuation={punctuation} setPunctuation={setPunctuation}
            numbers={numbers} setNumbers={setNumbers}
            language={language} setLanguage={setLanguage}
            quoteLength={quoteLength} setQuoteLength={setQuoteLength}
            difficulty={difficulty} setDifficulty={setDifficulty}
            codeLanguage={codeLanguage} setCodeLanguage={setCodeLanguage}
            visible={showChrome}
            disabled={status === 'running'}
            onReset={resetTest}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />

          {/* Content */}
          {status !== 'finished' ? (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
              <Timer timeLeft={timeLeft} status={status} mode={mode} liveWpm={liveWpm} elapsedTime={elapsedTime} />
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
                animate={{ opacity: (status === 'idle' || (mode === 'zen' && status === 'running')) ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-center mt-10"
                style={{ pointerEvents: 'none' }}
              >
                <span className="tip-glow text-[11px] tracking-wider">
                  <kbd className="glass rounded px-1.5 py-0.5 text-[10px] mx-0.5">esc</kbd>
                  <span className="ml-1.5">{mode === 'zen' && status === 'running' ? '- end session' : '- restart test'}</span>
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Results stats={stats} duration={stats?.elapsedSeconds || duration} mode={mode} language={language} punctuation={punctuation} numbers={numbers} wordCount={wordCount} difficulty={difficulty} />
            </motion.div>
          )}
        </div>

        {/* Branding */}
        <div className="text-center py-6 text-[11px]" style={{ color: 'var(--t-sub)' }}>
          <span>Made in 🇮🇳 with ❤️ by </span>
          <a href="https://mohitbagri-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MOHIT BAGRI</a>
          <span className="mx-2">|</span>
          <a href="https://github.com/Mohit-Bagri/velotype" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--t-sub)' }}>
            ⭐ Star on GitHub
          </a>
        </div>
      </main>
    </div>
  )
}

export default App
