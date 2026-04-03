import { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react'

const FONT_SIZES = {
  1: { fontSize: '1.1rem', lineHeight: 38 },
  2: { fontSize: '1.45rem', lineHeight: 48 },
  3: { fontSize: '1.8rem', lineHeight: 58 },
  4: { fontSize: '2.2rem', lineHeight: 68 },
}

const VISIBLE_LINES = 3
const CARET_TRANSITION = 'transform 100ms cubic-bezier(0.17, 0.67, 0.5, 1), opacity 0.15s ease'

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function getColors() {
  return {
    untyped: getCSSVar('--t-sub'),
    correct: getCSSVar('--t-correct'),
    error: getCSSVar('--t-error'),
    extra: getCSSVar('--t-error-extra'),
    caret: getCSSVar('--t-caret'),
  }
}

export default function TypingArea({
  words, currentWordIndex, currentCharIndex, typed, status, onKeyDown,
  blindMode = false, fontSize = 2, paceCaretEnabled = false, paceCaretSpeed = 60,
  startTime, funbox = 'none',
}) {
  const fontConfig = FONT_SIZES[fontSize] || FONT_SIZES[2]
  const LINE_HEIGHT = fontConfig.lineHeight

  const [colors, setColors] = useState(getColors)

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(getColors()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const containerRef = useRef(null)
  const wordsRef = useRef(null)
  const wordEls = useRef({})
  const charEls = useRef({})
  const [scrollY, setScrollY] = useState(0)
  const inputRef = useRef(null)
  const [focused, setFocused] = useState(true)
  const [capsLock, setCapsLock] = useState(false)

  // Smooth caret state
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0 })
  const [caretVisible, setCaretVisible] = useState(false)
  const skipTransitionRef = useRef(true)
  const caretIdleRef = useRef(null)
  const [caretIdle, setCaretIdle] = useState(true)

  // Pace caret state
  const [pacePos, setPacePos] = useState(null)
  const paceIntervalRef = useRef(null)

  // Scroll: keep current word visible
  useLayoutEffect(() => {
    const el = wordEls.current[currentWordIndex]
    if (!el) return
    const line = Math.floor(el.offsetTop / LINE_HEIGHT)
    const target = Math.max(0, line * LINE_HEIGHT)
    setScrollY(prev => target >= prev ? target : prev)
  }, [currentWordIndex, LINE_HEIGHT])

  // Reset on new words
  useEffect(() => {
    setScrollY(0)
    charEls.current = {}
    skipTransitionRef.current = true
    setCaretVisible(false)
    setPacePos(null)
    requestAnimationFrame(() => {
      setCaretVisible(true)
      requestAnimationFrame(() => { skipTransitionRef.current = false })
    })
  }, [words])

  // Calculate caret position
  useLayoutEffect(() => {
    let el = null
    let x = 0, y = 0

    if (currentCharIndex === 0) {
      el = wordEls.current[currentWordIndex]
      if (el) {
        const firstChar = charEls.current[`${currentWordIndex}-0`]
        const ref = firstChar || el
        x = ref.offsetLeft
        y = ref.offsetTop
      }
    } else {
      const key = `${currentWordIndex}-${currentCharIndex - 1}`
      el = charEls.current[key]
      if (el) {
        x = el.offsetLeft + el.offsetWidth
        y = el.offsetTop
      }
    }

    if (el) {
      setCaretPos({ x, y })
      setCaretVisible(true)
    }

    // Reset idle timer
    setCaretIdle(false)
    clearTimeout(caretIdleRef.current)
    caretIdleRef.current = setTimeout(() => setCaretIdle(true), 500)

    return () => clearTimeout(caretIdleRef.current)
  }, [currentWordIndex, currentCharIndex, typed, words])

  // Detect line jumps to skip transition
  const prevYRef = useRef(0)
  useLayoutEffect(() => {
    if (Math.abs(caretPos.y - prevYRef.current) > LINE_HEIGHT * 0.8) {
      skipTransitionRef.current = true
      requestAnimationFrame(() => { skipTransitionRef.current = false })
    }
    prevYRef.current = caretPos.y
  }, [caretPos.y, LINE_HEIGHT])

  // Pace caret logic
  useEffect(() => {
    clearInterval(paceIntervalRef.current)
    if (!paceCaretEnabled || !paceCaretSpeed || status !== 'running' || !startTime?.current) {
      setPacePos(null)
      return
    }

    paceIntervalRef.current = setInterval(() => {
      if (!startTime.current) return
      const elMs = Date.now() - startTime.current
      const elMin = elMs / 60000
      const targetChars = paceCaretSpeed * 5 * elMin

      // Convert char count to word/char position
      let charsSoFar = 0
      let targetWordIdx = 0
      let targetCharIdx = 0
      let found = false

      for (let wi = 0; wi < words.length; wi++) {
        const wordLen = words[wi].length + 1 // +1 for space
        if (charsSoFar + wordLen > targetChars) {
          targetWordIdx = wi
          targetCharIdx = Math.min(Math.floor(targetChars - charsSoFar), words[wi].length)
          found = true
          break
        }
        charsSoFar += wordLen
      }

      if (!found) {
        targetWordIdx = words.length - 1
        targetCharIdx = words[words.length - 1]?.length || 0
      }

      // Get DOM position
      let el = null
      if (targetCharIdx === 0) {
        el = charEls.current[`${targetWordIdx}-0`] || wordEls.current[targetWordIdx]
        if (el) setPacePos({ x: el.offsetLeft, y: el.offsetTop })
      } else {
        const key = `${targetWordIdx}-${targetCharIdx - 1}`
        el = charEls.current[key]
        if (el) setPacePos({ x: el.offsetLeft + el.offsetWidth, y: el.offsetTop })
      }
    }, 50)

    return () => clearInterval(paceIntervalRef.current)
  }, [paceCaretEnabled, paceCaretSpeed, status, startTime, words])

  // Focus management
  const focus = useCallback(() => {
    inputRef.current?.focus()
    setFocused(true)
  }, [])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') {
      requestAnimationFrame(focus)
    }
  }, [status, words, focus])

  // Detect caps lock
  useEffect(() => {
    const detectCaps = (e) => {
      if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'))
    }
    document.addEventListener('keydown', detectCaps, true)
    document.addEventListener('keyup', detectCaps, true)
    return () => {
      document.removeEventListener('keydown', detectCaps, true)
      document.removeEventListener('keyup', detectCaps, true)
    }
  }, [])

  const onInput = useCallback((e) => {
    if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') return
    e.preventDefault()
    e.stopPropagation()
    onKeyDown(e)
  }, [onKeyDown])

  const isMirror = funbox === 'mirror'

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full cursor-text select-none"
      onClick={focus}
    >
      <input
        ref={inputRef}
        onKeyDown={onInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onPaste={e => e.preventDefault()}
        autoFocus
        tabIndex={0}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing area"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: VISIBLE_LINES * LINE_HEIGHT,
          opacity: 0,
          fontSize: '16px',
          zIndex: 5,
          cursor: 'text',
        }}
      />

      {/* Caps lock warning */}
      {capsLock && focused && status !== 'finished' && status !== 'failed' && (
        <div className="flex items-center justify-center gap-2 mb-2 py-1.5 px-4 rounded-full text-[11px] font-medium mx-auto w-fit" style={{ background: 'var(--t-accent-soft)', color: 'var(--t-warn, var(--t-accent))' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Caps Lock is on
        </div>
      )}

      <div className="overflow-hidden relative" style={{ height: VISIBLE_LINES * LINE_HEIGHT }}>
        {!focused && status !== 'finished' && status !== 'failed' && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center backdrop-blur-sm rounded-xl" style={{ background: 'var(--t-unfocused-bg)' }}>
            <span className="text-sm" style={{ color: 'var(--t-sub)' }}>Click here to focus</span>
          </div>
        )}

        <div
          ref={wordsRef}
          style={{
            position: 'relative',
            fontSize: fontConfig.fontSize,
            lineHeight: `${LINE_HEIGHT}px`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0 12px',
            transform: `translateY(${-scrollY}px)${isMirror ? ' scaleX(-1)' : ''}`,
            transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          {/* Smooth caret */}
          {caretVisible && focused && status !== 'finished' && status !== 'failed' && (
            <div
              className={caretIdle ? 'caret' : ''}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 2.5,
                height: '1.3em',
                background: colors.caret,
                boxShadow: `0 0 8px ${colors.caret}`,
                borderRadius: 2,
                pointerEvents: 'none',
                zIndex: 2,
                transform: `translate3d(${caretPos.x}px, ${caretPos.y}px, 0)`,
                transition: skipTransitionRef.current ? 'none' : CARET_TRANSITION,
                willChange: 'transform',
              }}
            />
          )}

          {/* Pace caret (ghost) */}
          {paceCaretEnabled && pacePos && focused && status === 'running' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 2.5,
                height: '1.3em',
                background: colors.caret,
                opacity: 0.25,
                borderRadius: 2,
                pointerEvents: 'none',
                zIndex: 1,
                transform: `translate3d(${pacePos.x}px, ${pacePos.y}px, 0)`,
                transition: 'transform 80ms linear',
                willChange: 'transform',
              }}
            />
          )}

          {words.map((word, wi) => {
            const isCurrent = wi === currentWordIndex
            const isPast = wi < currentWordIndex
            const wordTyped = typed[wi] || {}

            let hasError = false
            if (isPast) {
              for (let c = 0; c < word.length; c++) {
                if (!wordTyped[c] || !wordTyped[c].correct) { hasError = true; break }
              }
              if (Object.keys(wordTyped).some(k => Number(k) >= word.length)) hasError = true
            }

            return (
              <span
                key={wi}
                ref={el => { if (el) wordEls.current[wi] = el }}
                style={{
                  textDecoration: hasError && isPast ? 'underline' : 'none',
                  textDecorationColor: hasError ? colors.error : undefined,
                  textUnderlineOffset: '6px',
                  textDecorationThickness: '2px',
                }}
              >
                {word.split('').map((char, ci) => {
                  const cd = wordTyped[ci]
                  let color = colors.untyped
                  if (cd && !blindMode) {
                    color = cd.correct ? colors.correct : colors.error
                  }

                  return (
                    <span
                      key={ci}
                      ref={el => { if (el) charEls.current[`${wi}-${ci}`] = el }}
                      style={{ color, transition: 'color 0.06s ease' }}
                    >
                      {char}
                    </span>
                  )
                })}

                {!blindMode && Object.keys(wordTyped)
                  .map(Number)
                  .filter(idx => idx >= word.length)
                  .sort((a, b) => a - b)
                  .map(idx => (
                    <span
                      key={`x${idx}`}
                      ref={el => { if (el) charEls.current[`${wi}-${idx}`] = el }}
                      style={{ color: colors.extra }}
                    >
                      {wordTyped[idx].char}
                    </span>
                  ))
                }
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
