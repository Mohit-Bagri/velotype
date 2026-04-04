import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Timer from './components/Timer'
import TypingArea from './components/TypingArea'
import Results from './components/Results'
import CustomTextModal from './components/CustomTextModal'
import History from './components/History'
import { useTypingTest } from './hooks/useTypingTest'
import { useSound } from './hooks/useSound'

const SETTINGS_KEY = 'velotype-settings'

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
  } catch { return {} }
}

function useSetting(key, defaultVal) {
  const [value, setValue] = useState(() => {
    const saved = loadSettings()[key]
    return saved !== undefined ? saved : defaultVal
  })
  useEffect(() => {
    const s = loadSettings()
    s[key] = value
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  }, [key, value])
  return [value, setValue]
}

const LOGO = [
  '██╗   ██╗███████╗██╗      ██████╗ ████████╗██╗   ██╗██████╗ ███████╗',
  '██║   ██║██╔════╝██║     ██╔═══██╗╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝',
  '██║   ██║█████╗  ██║     ██║   ██║   ██║    ╚████╔╝ ██████╔╝█████╗',
  '╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝',
  ' ╚████╔╝ ███████╗███████╗╚██████╔╝   ██║      ██║   ██║     ███████╗',
  '  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝    ╚═╝      ╚═╝   ╚═╝     ╚══════╝',
].join('\n')

function App() {
  // ── Core test settings (persisted) ──
  const [mode, setMode] = useSetting('mode', 'time')
  const [duration, setDuration] = useSetting('duration', 15)
  const [wordCount, setWordCount] = useSetting('wordCount', 25)
  const [punctuation, setPunctuation] = useSetting('punctuation', false)
  const [numbers, setNumbers] = useSetting('numbers', false)
  const [language, setLanguage] = useSetting('language', 'english')
  const [quoteLength, setQuoteLength] = useSetting('quoteLength', 'short')
  const [difficulty, setDifficulty] = useSetting('difficulty', 'medium')
  const [codeLanguage, setCodeLanguage] = useSetting('codeLanguage', 'javascript')
  const [customWords, setCustomWords] = useState(null)
  const [customTextOpen, setCustomTextOpen] = useState(false)
  const [view, setView] = useState('test')

  // ── Advanced settings (persisted) ──
  const [stopOnError, setStopOnError] = useSetting('stopOnError', 'off')
  const [confidenceMode, setConfidenceMode] = useSetting('confidenceMode', 'off')
  const [blindMode, setBlindMode] = useSetting('blindMode', false)
  const [freedomMode, setFreedomMode] = useSetting('freedomMode', false)
  const [strictSpace, setStrictSpace] = useSetting('strictSpace', false)
  const [fontSize, setFontSize] = useSetting('fontSize', 2)
  const [speedUnit, setSpeedUnit] = useSetting('speedUnit', 'wpm')
  const [paceCaretEnabled, setPaceCaretEnabled] = useSetting('paceCaretEnabled', false)
  const [paceCaretSpeed, setPaceCaretSpeed] = useSetting('paceCaretSpeed', 60)
  const [minWpm, setMinWpm] = useSetting('minWpm', 0)
  const [minAccuracy, setMinAccuracy] = useSetting('minAccuracy', 0)
  const [funbox, setFunbox] = useSetting('funbox', 'none')

  // ── Sound & theme ──
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('velotype-sound') !== 'false'
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('velotype-theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('velotype-theme', theme)
  }, [theme])

  const {
    words, currentWordIndex, currentCharIndex, typed,
    status, timeLeft, liveWpm, elapsedTime, failReason,
    handleKeyDown, resetTest, repeatTest, getStats, finishZen,
    startTime,
  } = useTypingTest({
    mode, duration, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords,
    stopOnError, confidenceMode, freedomMode, strictSpace, minWpm, minAccuracy, funbox,
  })

  const { playType, playError, playSpace, playBack } = useSound(soundEnabled)
  const [stats, setStats] = useState(null)
  const showChrome = status !== 'running'

  useEffect(() => {
    if (status === 'finished' || status === 'failed') {
      try {
        const s = getStats()
        console.log('[VeloType] Test finished. Stats:', s)
        setStats(s)
      } catch (err) {
        console.error('[VeloType] Error getting stats:', err)
        setStats(null)
      }
    } else {
      setStats(null)
    }
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
      if (e.key === 'Escape') {
        e.preventDefault()
        if (mode === 'zen' && status === 'running') { finishZen(); return }
        resetTest()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [resetTest, finishZen, mode, status])

  // Save to history
  useEffect(() => {
    if (stats && !stats.suspicious && status === 'finished') {
      const h = JSON.parse(localStorage.getItem('velotype-history') || '[]')
      h.push({ wpm: stats.wpm, rawWpm: stats.rawWpm, accuracy: stats.accuracy, consistency: stats.consistency, duration: stats.elapsedSeconds, mode, language, difficulty, date: new Date().toISOString() })
      if (h.length > 200) h.shift()
      localStorage.setItem('velotype-history', JSON.stringify(h))
    }
  }, [stats, mode, language, status])

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

  const isTestDone = status === 'finished' || status === 'failed'

  if (view === 'history') {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-start px-4 sm:px-8 pt-8">
          <History onBack={() => setView('test')} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Custom text modal */}
      <CustomTextModal open={customTextOpen} onClose={() => setCustomTextOpen(false)} onSubmit={handleCustomSubmit} />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-[1000px]">

          {/* Logo */}
          <motion.div
            animate={{ opacity: showChrome ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="flex justify-center mb-4"
          >
            <h1 className="sr-only">VeloType - Typing Speed Test</h1>
            <pre className="ascii-glow select-none text-left" aria-hidden="true" style={{ maxWidth: '100%', overflow: 'hidden' }}>{LOGO}</pre>
          </motion.div>

          {/* Floating navbar — centered below logo */}
          <Header
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
            stopOnError={stopOnError} setStopOnError={setStopOnError}
            confidenceMode={confidenceMode} setConfidenceMode={setConfidenceMode}
            blindMode={blindMode} setBlindMode={setBlindMode}
            freedomMode={freedomMode} setFreedomMode={setFreedomMode}
            strictSpace={strictSpace} setStrictSpace={setStrictSpace}
            fontSize={fontSize} setFontSize={setFontSize}
            speedUnit={speedUnit} setSpeedUnit={setSpeedUnit}
            paceCaretEnabled={paceCaretEnabled} setPaceCaretEnabled={setPaceCaretEnabled}
            paceCaretSpeed={paceCaretSpeed} setPaceCaretSpeed={setPaceCaretSpeed}
            minWpm={minWpm} setMinWpm={setMinWpm}
            minAccuracy={minAccuracy} setMinAccuracy={setMinAccuracy}
            funbox={funbox} setFunbox={setFunbox}
            theme={theme} setTheme={setTheme}
            onHistoryClick={() => setView('history')}
          />

          {/* Active mode indicator */}
          <motion.div
            animate={{ opacity: showChrome ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ textAlign: 'center', marginBottom: 20, fontSize: 11, color: 'var(--t-sub)', letterSpacing: '0.05em' }}
          >
            <span style={{ color: 'var(--t-accent)' }}>{mode}</span>
            {mode === 'time' && <><Dot />{duration}s</>}
            {mode === 'words' && <><Dot />{wordCount} words</>}
            {mode === 'quote' && <><Dot />{quoteLength}</>}
            {mode === 'code' && <><Dot />{codeLanguage}</>}
            {mode !== 'custom' && mode !== 'code' && <><Dot />{language}</>}
            {mode !== 'quote' && mode !== 'custom' && mode !== 'code' && <><Dot />{difficulty}</>}
            {punctuation && <><Dot />punctuation</>}
            {numbers && <><Dot />numbers</>}
            {funbox !== 'none' && <><Dot />{funbox}</>}
          </motion.div>

          {/* Content */}
          {!isTestDone ? (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
              <Timer timeLeft={timeLeft} status={status} mode={mode} liveWpm={liveWpm} elapsedTime={elapsedTime} speedUnit={speedUnit} />
              <TypingArea
                words={words}
                currentWordIndex={currentWordIndex}
                currentCharIndex={currentCharIndex}
                typed={typed}
                status={status}
                onKeyDown={handleKeyDownWithSound}
                blindMode={blindMode}
                fontSize={fontSize}
                paceCaretEnabled={paceCaretEnabled}
                paceCaretSpeed={paceCaretSpeed}
                startTime={startTime}
                funbox={funbox}
                disabled={customTextOpen}
              />
              {/* Tip */}
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
              <Results
                stats={stats}
                duration={stats?.elapsedSeconds || duration}
                mode={mode}
                language={language}
                punctuation={punctuation}
                numbers={numbers}
                wordCount={wordCount}
                difficulty={difficulty}
                speedUnit={speedUnit}
                failReason={failReason}
              />
            </motion.div>
          )}
        </div>

        {/* Branding */}
        <Footer />
      </main>
    </div>
  )
}

function Dot() {
  return <span style={{ margin: '0 6px', opacity: 0.3 }}>/</span>
}

function Footer() {
  return (
    <div style={{ textAlign: 'center', padding: '56px 0 32px', fontSize: 11, color: 'var(--t-sub)' }}>
      <span>Made in 🇮🇳 with ❤️ by </span>
      <a href="https://mohitbagri-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MOHIT BAGRI</a>
      <span style={{ margin: '0 12px', opacity: 0.3 }}>|</span>
      <span>⭐ </span>
      <a href="https://github.com/Mohit-Bagri/velotype" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Star on GitHub</a>
    </div>
  )
}

export default App
