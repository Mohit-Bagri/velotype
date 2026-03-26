import { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react'

const LINE_HEIGHT = 48
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

export default function TypingArea({ words, currentWordIndex, currentCharIndex, typed, status, onKeyDown }) {
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

  // Scroll: keep current word visible
  useLayoutEffect(() => {
    const el = wordEls.current[currentWordIndex]
    if (!el) return
    const line = Math.floor(el.offsetTop / LINE_HEIGHT)
    const target = Math.max(0, line * LINE_HEIGHT)
    setScrollY(prev => target >= prev ? target : prev)
  }, [currentWordIndex])

  // Reset on new words
  useEffect(() => {
    setScrollY(0)
    charEls.current = {}
    skipTransitionRef.current = true
    setCaretVisible(false)
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
        x = el.offsetLeft
        // Use getBoundingClientRect relative to words container for precise Y
        if (wordsRef.current) {
          const parentRect = wordsRef.current.getBoundingClientRect()
          const refRect = ref.getBoundingClientRect()
          y = refRect.top - parentRect.top + scrollY  // undo the scroll transform
        } else {
          y = ref.offsetTop
        }
      }
    } else {
      const key = `${currentWordIndex}-${currentCharIndex - 1}`
      el = charEls.current[key]
      if (el && wordsRef.current) {
        const parentRect = wordsRef.current.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        x = elRect.right - parentRect.left
        y = elRect.top - parentRect.top + scrollY
      }
    }

    if (el) {
      setCaretPos({ x, y })
      setCaretVisible(true)
    }

    // Reset idle timer (caret stays solid while typing, pulses when idle)
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
  }, [caretPos.y])

  // Focus management
  const focus = useCallback(() => {
    inputRef.current?.focus()
    setFocused(true)
  }, [])

  useEffect(() => {
    if (status !== 'finished') {
      requestAnimationFrame(focus)
    }
  }, [status, words, focus])

  const onInput = useCallback((e) => {
    setCapsLock(e.getModifierState('CapsLock'))
    if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter') return
    e.preventDefault()
    e.stopPropagation()
    onKeyDown(e)
  }, [onKeyDown])

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
          zIndex: 5,
          cursor: 'text',
        }}
      />

      {/* Caps lock warning */}
      {capsLock && focused && status !== 'finished' && (
        <div className="flex items-center justify-center gap-2 mb-2 py-1.5 px-4 rounded-full text-[11px] font-medium mx-auto w-fit" style={{ background: 'var(--t-accent-soft)', color: 'var(--t-warn, var(--t-accent))' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Caps Lock is on
        </div>
      )}

      <div className="overflow-hidden relative" style={{ height: VISIBLE_LINES * LINE_HEIGHT }}>
        {!focused && status !== 'finished' && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center backdrop-blur-sm rounded-xl" style={{ background: 'var(--t-unfocused-bg)' }}>
            <span className="text-sm" style={{ color: 'var(--t-sub)' }}>Click here or press any key to focus</span>
          </div>
        )}

        <div
          ref={wordsRef}
          style={{
            position: 'relative',
            fontSize: '1.45rem',
            lineHeight: `${LINE_HEIGHT}px`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0 12px',
            transform: `translateY(${-scrollY}px)`,
            transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          {/* Smooth caret */}
          {caretVisible && focused && status !== 'finished' && (
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
                  if (cd) color = cd.correct ? colors.correct : colors.error

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

                {Object.keys(wordTyped)
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
