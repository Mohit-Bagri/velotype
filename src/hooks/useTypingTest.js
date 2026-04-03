import { useState, useCallback, useRef, useEffect } from 'react'
import { generateWords } from '../data/words'
import { getQuote } from '../data/quotes'
import { getCodeSnippet } from '../data/codeSnippets'

const SNAPSHOT_INTERVAL = 1000

function applyFunbox(words, funbox) {
  if (!funbox || funbox === 'none') return words
  return words.map(word => {
    switch (funbox) {
      case 'randomCase':
        return word.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('')
      case 'backwards':
        return word.split('').reverse().join('')
      case 'allCaps':
        return word.toUpperCase()
      default:
        return word
    }
  })
}

function getWordList({ mode, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords, funbox }) {
  let words
  if (mode === 'custom' && customWords) words = customWords
  else if (mode === 'code') words = getCodeSnippet(codeLanguage)
  else if (mode === 'quote') words = getQuote(quoteLength)
  else if (mode === 'words') words = generateWords(wordCount, { punctuation, numbers, language, difficulty })
  else if (mode === 'zen') words = generateWords(500, { punctuation, numbers, language, difficulty })
  else words = generateWords(250, { punctuation, numbers, language, difficulty })

  return applyFunbox(words, funbox)
}

export function useTypingTest({
  mode, duration, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords,
  stopOnError = 'off', confidenceMode = 'off', freedomMode = false, strictSpace = false,
  minWpm = 0, minAccuracy = 0, funbox = 'none',
}) {
  const [words, setWords] = useState(() =>
    getWordList({ mode, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords, funbox })
  )
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [typed, setTyped] = useState({})
  const [status, setStatus] = useState('idle')
  const [timeLeft, setTimeLeft] = useState(duration)
  const [wpmHistory, setWpmHistory] = useState([])
  const [rawWpmHistory, setRawWpmHistory] = useState([])
  const [errorHistory, setErrorHistory] = useState([])

  const [liveWpm, setLiveWpm] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [failReason, setFailReason] = useState(null)

  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const snapshotRef = useRef(null)
  const liveWpmRef = useRef(null)
  const totalCorrectRef = useRef(0)
  const totalTypedRef = useRef(0)
  const totalErrorsRef = useRef(0)
  const prevSnapshotErrorsRef = useRef(0)
  const keystrokeTimesRef = useRef([])
  const suspiciousRef = useRef(false)
  const failedRef = useRef(false)

  // Burst speed tracking
  const wordStartTimeRef = useRef(null)
  const burstSpeedsRef = useRef([])

  // Keypress interval tracking
  const keypressIntervalsRef = useRef([])
  const lastKeypressTimeRef = useRef(null)

  // Repeat test support
  const lastWordsRef = useRef(null)

  const resetTest = useCallback((repeatWords = null) => {
    clearInterval(timerRef.current)
    clearInterval(snapshotRef.current)
    clearInterval(liveWpmRef.current)
    const newWords = (Array.isArray(repeatWords) && repeatWords.length > 0)
      ? repeatWords
      : getWordList({ mode, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords, funbox })
    setWords(newWords)
    lastWordsRef.current = newWords
    setCurrentWordIndex(0)
    setCurrentCharIndex(0)
    setTyped({})
    setStatus('idle')
    setTimeLeft(duration)
    setLiveWpm(0)
    setElapsedTime(0)
    setWpmHistory([])
    setRawWpmHistory([])
    setErrorHistory([])
    setFailReason(null)
    startTimeRef.current = null
    totalCorrectRef.current = 0
    totalTypedRef.current = 0
    totalErrorsRef.current = 0
    prevSnapshotErrorsRef.current = 0
    keystrokeTimesRef.current = []
    suspiciousRef.current = false
    failedRef.current = false
    wordStartTimeRef.current = null
    burstSpeedsRef.current = []
    keypressIntervalsRef.current = []
    lastKeypressTimeRef.current = null
  }, [mode, duration, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords, funbox])

  const repeatTest = useCallback(() => {
    if (lastWordsRef.current) resetTest(lastWordsRef.current)
    else resetTest()
  }, [resetTest])

  useEffect(() => {
    resetTest()
  }, [mode, duration, wordCount, punctuation, numbers, language, quoteLength, difficulty, codeLanguage, customWords, funbox, resetTest])

  const startTest = useCallback(() => {
    if (status !== 'idle') return
    setStatus('running')
    startTimeRef.current = Date.now()
    wordStartTimeRef.current = Date.now()

    // Only time mode has a countdown
    if (mode === 'time') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            clearInterval(snapshotRef.current)
            setStatus('finished')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Live WPM + elapsed time + threshold checks
    liveWpmRef.current = setInterval(() => {
      if (failedRef.current) return
      const elMs = Date.now() - startTimeRef.current
      const elMin = elMs / 60000
      if (elMin > 0) {
        const currentWpm = Math.round((totalCorrectRef.current / 5) / elMin)
        setLiveWpm(currentWpm)

        // Min WPM check (after 5s warmup)
        if (minWpm > 0 && elMs > 5000 && currentWpm < minWpm && totalTypedRef.current > 20) {
          failedRef.current = true
          clearInterval(timerRef.current)
          clearInterval(snapshotRef.current)
          clearInterval(liveWpmRef.current)
          setFailReason(`WPM dropped below ${minWpm}`)
          setStatus('failed')
          return
        }

        // Min accuracy check (after 10 chars)
        if (minAccuracy > 0 && totalTypedRef.current > 10) {
          const currentAcc = Math.round((totalCorrectRef.current / totalTypedRef.current) * 100)
          if (currentAcc < minAccuracy) {
            failedRef.current = true
            clearInterval(timerRef.current)
            clearInterval(snapshotRef.current)
            clearInterval(liveWpmRef.current)
            setFailReason(`Accuracy dropped below ${minAccuracy}%`)
            setStatus('failed')
            return
          }
        }
      }
      if (mode === 'zen') {
        setElapsedTime(Math.round(elMs / 1000))
      }
    }, 500)

    snapshotRef.current = setInterval(() => {
      if (failedRef.current) return
      const elapsed = (Date.now() - startTimeRef.current) / 60000
      if (elapsed <= 0) return
      const wpm = Math.round((totalCorrectRef.current / 5) / elapsed)
      const rawWpm = Math.round((totalTypedRef.current / 5) / elapsed)
      const snapshotErrors = totalErrorsRef.current - prevSnapshotErrorsRef.current
      prevSnapshotErrorsRef.current = totalErrorsRef.current
      setWpmHistory(prev => [...prev, wpm])
      setRawWpmHistory(prev => [...prev, rawWpm])
      setErrorHistory(prev => [...prev, Math.max(0, snapshotErrors)])
    }, SNAPSHOT_INTERVAL)
  }, [status, mode, minWpm, minAccuracy])

  // Finish when all words typed (words/quote/custom/code)
  useEffect(() => {
    if ((mode === 'words' || mode === 'quote' || mode === 'custom' || mode === 'code') && status === 'running' && currentWordIndex >= words.length) {
      clearInterval(timerRef.current)
      clearInterval(snapshotRef.current)
      clearInterval(liveWpmRef.current)
      setStatus('finished')
    }
  }, [mode, status, currentWordIndex, words.length])

  // Zen mode: generate more words when approaching the end
  useEffect(() => {
    if (mode === 'zen' && status === 'running' && currentWordIndex >= words.length - 20) {
      const more = applyFunbox(
        generateWords(200, { punctuation, numbers, language, difficulty }),
        funbox
      )
      setWords(prev => [...prev, ...more])
    }
  }, [mode, status, currentWordIndex, words.length, punctuation, numbers, language, funbox])

  // Helper: check if a word has any errors
  const wordHasErrors = useCallback((wordIndex) => {
    const word = words[wordIndex]
    if (!word) return false
    const wordTyped = typed[wordIndex] || {}
    for (let c = 0; c < word.length; c++) {
      if (!wordTyped[c] || !wordTyped[c].correct) return true
    }
    if (Object.keys(wordTyped).some(k => Number(k) >= word.length)) return true
    return false
  }, [words, typed])

  const handleKeyDown = useCallback((e) => {
    if (status === 'finished' || status === 'failed') return

    if (status === 'idle' && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      startTest()
    }

    const isActive = status === 'running' || (status === 'idle' && e.key.length === 1)
    if (!isActive) return
    if (e.ctrlKey || e.altKey || e.metaKey) return

    const currentWord = words[currentWordIndex]
    if (!currentWord) return

    // Track keypress intervals for timing stats
    const now = Date.now()
    if (e.key.length === 1 && lastKeypressTimeRef.current) {
      keypressIntervalsRef.current.push(now - lastKeypressTimeRef.current)
    }
    if (e.key.length === 1) lastKeypressTimeRef.current = now

    if (e.key === ' ') {
      if (currentCharIndex === 0) return

      // Strict space: block if word has any errors or isn't fully typed
      if (strictSpace) {
        if (currentCharIndex < currentWord.length) return
        if (wordHasErrors(currentWordIndex)) return
      }

      // Stop on error (word): block space if word has errors or isn't fully typed
      if (stopOnError === 'word' || stopOnError === 'letter') {
        if (currentCharIndex < currentWord.length) return
        if (wordHasErrors(currentWordIndex)) return
      }

      // Confidence max: block space if word has errors
      if (confidenceMode === 'max') {
        if (currentCharIndex < currentWord.length) return
        if (wordHasErrors(currentWordIndex)) return
      }

      totalTypedRef.current += 1
      totalCorrectRef.current += 1

      // Count skipped characters as errors
      const skipped = Math.max(0, currentWord.length - currentCharIndex)
      if (skipped > 0) {
        totalErrorsRef.current += skipped
        totalTypedRef.current += skipped
      }

      // Track burst speed for completed word
      if (wordStartTimeRef.current) {
        const wordTime = Date.now() - wordStartTimeRef.current
        if (wordTime > 0) {
          const wordChars = currentCharIndex
          const burstWpm = Math.round((wordChars / 5) / (wordTime / 60000))
          burstSpeedsRef.current.push(burstWpm)
        }
      }
      wordStartTimeRef.current = Date.now()

      // Finish on last word (words/quote/custom/code modes)
      if ((mode === 'words' || mode === 'quote' || mode === 'custom' || mode === 'code') && currentWordIndex === words.length - 1) {
        clearInterval(timerRef.current)
        clearInterval(snapshotRef.current)
        clearInterval(liveWpmRef.current)
        setCurrentWordIndex(prev => prev + 1)
        setStatus('finished')
        return
      }

      setCurrentWordIndex(prev => prev + 1)
      setCurrentCharIndex(0)
      return
    }

    if (e.key === 'Backspace') {
      // Confidence mode: block backspace entirely
      if (confidenceMode === 'on' || confidenceMode === 'max') return

      if (currentCharIndex > 0) {
        const prevIdx = currentCharIndex - 1
        const charData = typed[currentWordIndex]?.[prevIdx]
        if (charData) {
          totalTypedRef.current = Math.max(0, totalTypedRef.current - 1)
          if (charData.correct) {
            totalCorrectRef.current = Math.max(0, totalCorrectRef.current - 1)
          } else {
            totalErrorsRef.current = Math.max(0, totalErrorsRef.current - 1)
          }
        }
        setTyped(prev => {
          const wordTyped = { ...prev[currentWordIndex] }
          delete wordTyped[prevIdx]
          return { ...prev, [currentWordIndex]: wordTyped }
        })
        setCurrentCharIndex(prevIdx)
      } else if (freedomMode && currentWordIndex > 0) {
        // Freedom mode: go back to previous word
        const prevWordIndex = currentWordIndex - 1
        const prevWordTyped = typed[prevWordIndex] || {}
        const typedKeys = Object.keys(prevWordTyped).map(Number)
        const prevCharIdx = typedKeys.length > 0 ? Math.max(...typedKeys) + 1 : 0

        // Undo the space that was counted
        totalTypedRef.current = Math.max(0, totalTypedRef.current - 1)
        totalCorrectRef.current = Math.max(0, totalCorrectRef.current - 1)

        // Undo skipped chars that were counted as errors
        const prevWord = words[prevWordIndex]
        if (prevWord) {
          const typedCount = typedKeys.filter(k => k < prevWord.length).length
          const skipped = Math.max(0, prevWord.length - typedCount)
          if (skipped > 0) {
            totalErrorsRef.current = Math.max(0, totalErrorsRef.current - skipped)
            totalTypedRef.current = Math.max(0, totalTypedRef.current - skipped)
          }
        }

        // Remove burst speed for this word transition
        burstSpeedsRef.current.pop()
        wordStartTimeRef.current = Date.now()

        setCurrentWordIndex(prevWordIndex)
        setCurrentCharIndex(prevCharIdx)
      }
      return
    }

    if (e.key.length !== 1) return

    // Stop on error (letter): block input if previous char was wrong
    if (stopOnError === 'letter' && currentCharIndex > 0) {
      const prevCharData = typed[currentWordIndex]?.[currentCharIndex - 1]
      if (prevCharData && !prevCharData.correct) return
    }

    // Anti-cheat: track keystroke timing
    keystrokeTimesRef.current.push(now)
    if (keystrokeTimesRef.current.length > 20) {
      const recent = keystrokeTimesRef.current.slice(-20)
      const fastCount = recent.filter((t, i) => i > 0 && t - recent[i - 1] < 25).length
      if (fastCount > 10) suspiciousRef.current = true
    }

    const expectedChar = currentWord[currentCharIndex]
    const isCorrect = e.key === expectedChar
    const isExtra = currentCharIndex >= currentWord.length

    totalTypedRef.current += 1
    if (isCorrect && !isExtra) {
      totalCorrectRef.current += 1
    } else {
      totalErrorsRef.current += 1
    }

    setTyped(prev => ({
      ...prev,
      [currentWordIndex]: {
        ...prev[currentWordIndex],
        [currentCharIndex]: {
          char: e.key,
          correct: isCorrect && !isExtra,
          extra: isExtra,
        }
      }
    }))
    setCurrentCharIndex(prev => prev + 1)

    // No auto-finish on last char — user must press space to submit the last word
  }, [status, words, currentWordIndex, currentCharIndex, typed, startTest, mode, stopOnError, confidenceMode, freedomMode, strictSpace, wordHasErrors])

  const finishZen = useCallback(() => {
    if (mode !== 'zen' || status !== 'running') return
    clearInterval(timerRef.current)
    clearInterval(snapshotRef.current)
    clearInterval(liveWpmRef.current)
    setStatus('finished')
  }, [mode, status])

  const getElapsedSeconds = useCallback(() => {
    if (!startTimeRef.current) return mode === 'time' ? duration : 0
    if (mode === 'time') return duration
    return Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
  }, [mode, duration])

  const getStats = useCallback(() => {
    const elapsedSec = getElapsedSeconds()
    const elapsed = elapsedSec / 60
    const correct = totalCorrectRef.current
    const totalChars = totalTypedRef.current
    const errors = totalErrorsRef.current

    const wpm = elapsed > 0 ? Math.round((correct / 5) / elapsed) : 0
    const rawWpm = elapsed > 0 ? Math.round((totalChars / 5) / elapsed) : 0
    const accuracy = totalChars > 0 ? Math.round((correct / totalChars) * 100) : 100

    // Missed = untyped character positions across all attempted words
    let missed = 0
    for (let i = 0; i <= Math.min(currentWordIndex, words.length - 1); i++) {
      const word = words[i]
      const wordTyped = typed[i] || {}
      const typedCount = Object.keys(wordTyped).filter(k => Number(k) < word.length).length
      missed += Math.max(0, word.length - typedCount)
    }

    let consistency = 100
    if (wpmHistory.length > 1) {
      const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length
      const variance = wpmHistory.reduce((a, b) => a + (b - mean) ** 2, 0) / wpmHistory.length
      const cv = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0
      consistency = Math.max(0, Math.round(100 - cv))
    }

    const suspicious = suspiciousRef.current || wpm > 300

    // Burst speed stats
    const bursts = burstSpeedsRef.current
    const avgBurst = bursts.length > 0 ? Math.round(bursts.reduce((a, b) => a + b, 0) / bursts.length) : 0
    const maxBurst = bursts.length > 0 ? Math.max(...bursts) : 0
    const minBurst = bursts.length > 0 ? Math.min(...bursts) : 0

    // Keypress timing stats
    const intervals = keypressIntervalsRef.current
    const avgKeypressTime = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0
    const keypressStdDev = intervals.length > 1 ? Math.round(Math.sqrt(intervals.reduce((a, b) => a + (b - avgKeypressTime) ** 2, 0) / intervals.length)) : 0

    return {
      wpm, rawWpm, accuracy, correct,
      incorrect: errors, missed, totalChars, consistency,
      wpmHistory, rawWpmHistory, errorHistory,
      elapsedSeconds: elapsedSec, suspicious,
      avgBurst, maxBurst, minBurst,
      avgKeypressTime, keypressStdDev,
    }
  }, [getElapsedSeconds, currentWordIndex, typed, words, wpmHistory, rawWpmHistory, errorHistory])

  return {
    words, currentWordIndex, currentCharIndex, typed,
    status, timeLeft, liveWpm, elapsedTime, failReason,
    handleKeyDown, resetTest, repeatTest, getStats, finishZen,
    startTime: startTimeRef,
  }
}
