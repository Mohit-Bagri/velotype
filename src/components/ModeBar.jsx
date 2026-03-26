import { motion } from 'framer-motion'
import { languages } from '../data/words'

const timeOpts = [15, 30, 60, 120]
const wordOpts = [10, 25, 50, 100]
const quoteOpts = ['short', 'medium', 'long']

export default function ModeBar({
  mode, setMode, duration, setDuration, wordCount, setWordCount,
  punctuation, setPunctuation, numbers, setNumbers,
  language, setLanguage, quoteLength, setQuoteLength,
  visible, disabled,
  onReset, soundEnabled, onToggleSound,
}) {
  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-3 mb-10"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      {/* Capsule navbar */}
      <nav
        className="inline-flex items-center gap-2 rounded-full px-6 py-3 transition-all duration-500 ease-out"
        style={{
          background: 'var(--t-nav-bg)',
          border: '1px solid var(--t-nav-border)',
          boxShadow: 'var(--t-nav-shadow)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {(mode === 'time' || mode === 'words') && (
          <>
            <NavPill active={punctuation} disabled={disabled} onClick={() => setPunctuation(!punctuation)}>
              @ punctuation
            </NavPill>
            <NavPill active={numbers} disabled={disabled} onClick={() => setNumbers(!numbers)}>
              # numbers
            </NavPill>
            <span className="w-px h-4 mx-1.5 shrink-0" style={{ background: 'var(--t-nav-border)' }} />
          </>
        )}

        <NavPill active={mode === 'time'} disabled={disabled} onClick={() => setMode('time')}>time</NavPill>
        <NavPill active={mode === 'words'} disabled={disabled} onClick={() => setMode('words')}>words</NavPill>
        <NavPill active={mode === 'quote'} disabled={disabled} onClick={() => setMode('quote')}>quote</NavPill>

        <span className="w-px h-4 mx-1.5 shrink-0" style={{ background: 'var(--t-nav-border)' }} />

        {mode === 'time' && timeOpts.map(t => (
          <NavPill key={t} active={t === duration} disabled={disabled} onClick={() => setDuration(t)}>{t}</NavPill>
        ))}
        {mode === 'words' && wordOpts.map(w => (
          <NavPill key={w} active={w === wordCount} disabled={disabled} onClick={() => setWordCount(w)}>{w}</NavPill>
        ))}
        {mode === 'quote' && quoteOpts.map(q => (
          <NavPill key={q} active={q === quoteLength} disabled={disabled} onClick={() => setQuoteLength(q)}>{q}</NavPill>
        ))}

        <span className="w-px h-4 mx-1.5 shrink-0" style={{ background: 'var(--t-nav-border)' }} />

        <button
          onClick={onReset}
          className="transition-colors cursor-pointer p-2 rounded-full" style={{ color: 'var(--t-sub)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--t-text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}
          title="Restart test"
          tabIndex={-1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
          </svg>
        </button>

        <button
          onClick={onToggleSound}
          className="transition-colors cursor-pointer p-2 rounded-full" style={{ color: 'var(--t-sub)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--t-text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          tabIndex={-1}
        >
          {soundEnabled ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

      </nav>

      {/* Language */}
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--t-sub)' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <select
          value={language}
          onChange={e => !disabled && setLanguage(e.target.value)}
          disabled={disabled}
          className="bg-transparent outline-none cursor-pointer appearance-none transition-all duration-200 disabled:opacity-40 text-[11px]" style={{ color: 'var(--t-sub)' }}
        >
          {languages.map(l => (
            <option key={l} value={l} style={{ background: 'var(--t-option-bg)', color: 'var(--t-text)' }}>{l}</option>
          ))}
        </select>
        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-40">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </motion.div>
  )
}

function NavPill({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap
        ${disabled ? 'opacity-30 !cursor-not-allowed' : ''}`}
      style={{
        color: active ? 'var(--t-text)' : 'var(--t-sub)',
        textShadow: active ? `0 0 12px var(--t-accent)` : 'none',
      }}
      onMouseEnter={e => { if (!active) e.target.style.color = 'var(--t-text)' }}
      onMouseLeave={e => { if (!active) e.target.style.color = 'var(--t-sub)' }}
    >
      {children}
    </button>
  )
}
