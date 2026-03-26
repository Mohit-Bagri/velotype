import { useState, useCallback, useRef, useEffect } from 'react'
import { generateWords } from '../data/words'
import { getQuote } from '../data/quotes'

const SNAPSHOT_INTERVAL = 1000

function getWordList({ mode, wordCount, punctuation, numbers, language, quoteLength }) {
  if (mode === 'quote') return getQuote(quoteLength)
  if (mode === 'words') return generateWords(wordCount, { punctuation, numbers, language })
  return generateWords(250, { punctuation, numbers, language }) // time mode
}

export function useTypingTest({ mode, duration, wordCount, punctuation, numbers, language, quoteLength }) {
  const [words, setWords] = useState(() =>
    getWordList({ mode, wordCount, punctuation, numbers, language, quoteLength })
  )
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [typed, setTyped] = useState({})
  const [status, setStatus] = useState('idle')
  const [timeLeft, setTimeLeft] = useState(duration)
  const [wpmHistory, setWpmHistory] = useState([])
  const [rawWpmHistory, setRawWpmHistory] = useState([])
  const [errorHistory, setErrorHistory] = useState([])

  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const snapshotRef = useRef(null)
  const totalCorrectRef = useRef(0)
  const totalTypedRef = useRef(0)
  const totalErrorsRef = useRef(0)
  const prevSnapshotErrorsRef = useRef(0)

  const resetTest = useCallback(() => {
    clearInterval(timerRef.current)
    clearInterval(snapshotRef.current)
    setWords(getWordList({ mode, wordCount, punctuation, numbers, language, quoteLength }))
    setCurrentWordIndex(0)
    setCurrentCharIndex(0)
    setTyped({})
    setStatus('idle')
    setTimeLeft(duration)
    setWpmHistory([])
    setRawWpmHistory([])
    setErrorHistory([])
    startTimeRef.current = null
    totalCorrectRef.current = 0
    totalTypedRef.current = 0
    totalErrorsRef.current = 0
    prevSnapshotErrorsRef.current = 0
  }, [mode, duration, wordCount, punctuation, numbers, language, quoteLength])

  useEffect(() => {
    resetTest()
  }, [mode, duration, wordCount, punctuation, numbers, language, quoteLength, resetTest])

  const startTest = useCallback(() => {
    if (status !== 'idle') return
    setStatus('running')
    startTimeRef.current = Date.now()

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

    snapshotRef.current = setInterval(() => {
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
  }, [status, mode])

  // Finish when all words typed (words mode and quote mode)
  useEffect(() => {
    if ((mode === 'words' || mode === 'quote') && status === 'running' && currentWordIndex >= words.length) {
      clearInterval(timerRef.current)
      clearInterval(snapshotRef.current)
      setStatus('finished')
    }
  }, [mode, status, currentWordIndex, words.length])

  const handleKeyDown = useCallback((e) => {
    if (status === 'finished') return

    if (status === 'idle' && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      startTest()
    }

    const isActive = status === 'running' || (status === 'idle' && e.key.length === 1)
    if (!isActive) return
    if (e.ctrlKey || e.altKey || e.metaKey) return

    const currentWord = words[currentWordIndex]
    if (!currentWord) return

    if (e.key === ' ') {
      if (currentCharIndex === 0) return
      totalTypedRef.current += 1
      totalCorrectRef.current += 1
      setCurrentWordIndex(prev => prev + 1)
      setCurrentCharIndex(0)
      return
    }

    if (e.key === 'Backspace') {
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
      }
      return
    }

    if (e.key.length !== 1) return

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

    // Auto-finish on last character of last word (words/quote modes)
    if ((mode === 'words' || mode === 'quote') && currentWordIndex === words.length - 1 && currentCharIndex + 1 >= currentWord.length) {
      clearInterval(timerRef.current)
      clearInterval(snapshotRef.current)
      setCurrentWordIndex(prev => prev + 1)
      setStatus('finished')
    }
  }, [status, words, currentWordIndex, currentCharIndex, typed, startTest, mode])

  const getElapsedSeconds = useCallback(() => {
    if (!startTimeRef.current) return duration
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

    let missed = 0
    for (let i = 0; i < currentWordIndex; i++) {
      const word = words[i]
      const wordTyped = typed[i] || {}
      missed += Math.max(0, word.length - Object.keys(wordTyped).length)
    }

    let consistency = 100
    if (wpmHistory.length > 1) {
      const mean = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length
      const variance = wpmHistory.reduce((a, b) => a + (b - mean) ** 2, 0) / wpmHistory.length
      const cv = mean > 0 ? (Math.sqrt(variance) / mean) * 100 : 0
      consistency = Math.max(0, Math.round(100 - cv))
    }

    return {
      wpm, rawWpm, accuracy, correct,
      incorrect: errors, missed, totalChars, consistency,
      wpmHistory, rawWpmHistory, errorHistory,
      elapsedSeconds: elapsedSec,
    }
  }, [getElapsedSeconds, currentWordIndex, typed, words, wpmHistory, rawWpmHistory, errorHistory])

  return {
    words, currentWordIndex, currentCharIndex, typed,
    status, timeLeft, handleKeyDown, resetTest, getStats,
  }
}
