import { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react'

const LINE_HEIGHT = 48
const VISIBLE_LINES = 3

const COL = {
  untyped: 'rgba(255,255,255,0.18)',
  correct: '#d1d0e0',
  error: '#f87171',
  extra: 'rgba(248,113,113,0.35)',
  caret: '#8b5cf6',
}

export default function TypingArea({ words, currentWordIndex, currentCharIndex, typed, status, onKeyDown }) {
  const colors = COL
  const containerRef = useRef(null)
  const wordsRef = useRef(null)
  const wordEls = useRef({})
  const [scrollY, setScrollY] = useState(0)
  const inputRef = useRef(null)
  const [focused, setFocused] = useState(true)

  // Scroll: keep current word visible
  useLayoutEffect(() => {
    const el = wordEls.current[currentWordIndex]
    if (!el) return
    const line = Math.floor(el.offsetTop / LINE_HEIGHT)
    const target = Math.max(0, line * LINE_HEIGHT)
    setScrollY(prev => target >= prev ? target : prev)
  }, [currentWordIndex])

  useEffect(() => { setScrollY(0) }, [words])

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

  // Keyboard handler on the input
  const onInput = useCallback((e) => {
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
      {/* Hidden but focusable input */}
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

      {/* Words display */}
      <div className="overflow-hidden relative" style={{ height: VISIBLE_LINES * LINE_HEIGHT }}>
        {/* Out-of-focus overlay */}
        {!focused && status !== 'finished' && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
            <span className="text-sub text-sm">Click here or press any key to focus</span>
          </div>
        )}

        <div
          ref={wordsRef}
          style={{
            fontSize: '1.45rem',
            lineHeight: `${LINE_HEIGHT}px`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0 12px',
            transform: `translateY(${-scrollY}px)`,
            transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          {words.map((word, wi) => {
            const isCurrent = wi === currentWordIndex
            const isPast = wi < currentWordIndex
            const wordTyped = typed[wi] || {}

            // Check past word errors
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
                {/* Caret at position 0 */}
                {isCurrent && currentCharIndex === 0 && <Caret focused={focused} caretColor={colors.caret} />}

                {word.split('').map((char, ci) => {
                  const cd = wordTyped[ci]
                  let color = colors.untyped
                  if (cd) color = cd.correct ? colors.correct : colors.error

                  return (
                    <span key={ci} style={{ color, transition: 'color 0.06s ease' }}>
                      {char}
                      {/* Caret after this char */}
                      {isCurrent && ci + 1 === currentCharIndex && currentCharIndex <= word.length && <Caret focused={focused} caretColor={colors.caret} />}
                    </span>
                  )
                })}

                {/* Extra chars beyond word length */}
                {Object.keys(wordTyped)
                  .map(Number)
                  .filter(idx => idx >= word.length)
                  .sort((a, b) => a - b)
                  .map(idx => (
                    <span key={`x${idx}`} style={{ color: colors.extra }}>
                      {wordTyped[idx].char}
                      {isCurrent && idx + 1 === currentCharIndex && <Caret focused={focused} caretColor={colors.caret} />}
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

function Caret({ focused, caretColor = '#8b5cf6' }) {
  return (
    <span
      className={focused ? 'caret' : ''}
      style={{
        display: 'inline-block',
        width: 2.5,
        height: '1.3em',
        background: caretColor,
        boxShadow: `0 0 8px ${caretColor}`,
        borderRadius: 2,
        verticalAlign: 'text-bottom',
        marginLeft: -1,
        marginRight: -1,
      }}
    />
  )
}
