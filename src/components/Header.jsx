import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { languages } from '../data/words'
import { codeLanguages } from '../data/codeSnippets'

const timeOpts = [15, 30, 60, 120]
const wordOpts = [10, 25, 50, 100]
const quoteOpts = ['short', 'medium', 'long']
const modes = ['time', 'words', 'quote', 'zen', 'custom', 'code']
const funboxOpts = ['none', 'randomCase', 'backwards', 'allCaps', 'mirror']
const funboxLabels = { none: 'none', randomCase: 'rAnDoM', backwards: 'sdrawkcab', allCaps: 'ALL CAPS', mirror: 'mirror' }

const themes = [
  { id: 'dark', name: 'Dark', accent: '#8b5cf6' },
  { id: 'light', name: 'Light', accent: '#7c3aed' },
  { id: 'serika-dark', name: 'Serika Dark', accent: '#e2b714' },
  { id: 'serika-light', name: 'Serika Light', accent: '#e2b714' },
  { id: 'nord', name: 'Nord', accent: '#88c0d0' },
  { id: 'dracula', name: 'Dracula', accent: '#bd93f9' },
  { id: 'monokai', name: 'Monokai', accent: '#f92672' },
  { id: 'ocean', name: 'Ocean', accent: '#5fb3b3' },
  { id: 'botanical', name: 'Botanical', accent: '#7db87d' },
]

const modeTips = { time: 'Type for a set duration', words: 'Type a fixed number of words', quote: 'Type famous quotes', zen: 'Endless typing, no pressure', custom: 'Paste your own text', code: 'Type real code snippets' }
const funboxTips = { none: 'No modifier', randomCase: 'Random upper/lowercase', backwards: 'Words are reversed', allCaps: 'All uppercase letters', mirror: 'Mirrored text display' }
const diffTips = { easy: 'Common short words', medium: 'Full word pool', hard: '6+ character words only' }

const cardStyle = { background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)', borderRadius: 10, padding: 12 }

export default function Header({
  mode, setMode, duration, setDuration, wordCount, setWordCount,
  punctuation, setPunctuation, numbers, setNumbers,
  language, setLanguage, quoteLength, setQuoteLength,
  difficulty, setDifficulty,
  codeLanguage, setCodeLanguage,
  visible, disabled,
  onReset, soundEnabled, onToggleSound,
  stopOnError, setStopOnError,
  confidenceMode, setConfidenceMode,
  blindMode, setBlindMode,
  freedomMode, setFreedomMode,
  strictSpace, setStrictSpace,
  fontSize, setFontSize,
  speedUnit, setSpeedUnit,
  paceCaretEnabled, setPaceCaretEnabled,
  paceCaretSpeed, setPaceCaretSpeed,
  minWpm, setMinWpm,
  minAccuracy, setMinAccuracy,
  funbox, setFunbox,
  theme, setTheme, onHistoryClick,
}) {
  // Which drawer is open: null | 'mode' | 'options' | 'settings' | 'theme'
  const [drawer, setDrawer] = useState(null)
  const toggle = (name) => setDrawer(prev => prev === name ? null : name)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && drawer) {
        e.stopPropagation()
        setDrawer(null)
      }
    }
    document.addEventListener('keydown', handleEsc, true)
    return () => document.removeEventListener('keydown', handleEsc, true)
  }, [drawer])

  return (
    <>
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        {/* Floating centered navbar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <nav className="velotype-nav" style={{
            display: 'inline-flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap', justifyContent: 'center',
            padding: '8px 16px', borderRadius: 16,
            background: 'var(--t-nav-bg)', border: '1px solid var(--t-nav-border)',
            boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}>
            <NavBtn label="Mode" onClick={() => toggle('mode')} active={drawer === 'mode'} disabled={disabled} />
            <NavBtn label="Options" onClick={() => toggle('options')} active={drawer === 'options'} disabled={disabled} />
            <NavBtn label="Settings" onClick={() => toggle('settings')} active={drawer === 'settings'} disabled={disabled} />
            <Sep />
            <IconBtn onClick={onReset} disabled={disabled} title="Restart test">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" /></svg>
            </IconBtn>
            <IconBtn onClick={onToggleSound} disabled={disabled} title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}>
              {soundEnabled ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
              )}
            </IconBtn>
            <Sep />
            <IconBtn onClick={onHistoryClick} title="History">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </IconBtn>
            <IconBtn onClick={() => toggle('theme')} title="Theme">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </IconBtn>
          </nav>
        </div>
      </motion.div>

      {/* ═══ SIDE DRAWER — slides from right, never overlaps content ═══ */}
      <AnimatePresence>
        {drawer && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawer(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            />
            {/* Panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999,
                width: 'min(380px, 85vw)', overflowY: 'auto',
                background: 'var(--t-bg-surface)', borderLeft: '1px solid var(--t-nav-border)',
                boxShadow: '-16px 0 48px rgba(0,0,0,0.3)',
              }}
            >
              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--t-divider)' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-text)', textTransform: 'capitalize' }}>{drawer}</span>
                <button onClick={() => setDrawer(null)} style={{ padding: 6, borderRadius: 8, cursor: 'pointer', color: 'var(--t-sub)', background: 'none', border: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--t-text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* Drawer content */}
              <div style={{ padding: 20 }}>
                {drawer === 'mode' && (
                  <>
                    <Label>Test mode</Label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                      {modes.map(m => <Chip key={m} active={mode === m} onClick={() => setMode(m)} tip={modeTips[m]}>{m}</Chip>)}
                    </div>
                    {mode === 'time' && (<><Label>Duration</Label><div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>{timeOpts.map(t => <Chip key={t} active={t === duration} onClick={() => setDuration(t)}>{t}s</Chip>)}</div></>)}
                    {mode === 'words' && (<><Label>Word count</Label><div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>{wordOpts.map(w => <Chip key={w} active={w === wordCount} onClick={() => setWordCount(w)}>{w}</Chip>)}</div></>)}
                    {mode === 'quote' && (<><Label>Quote length</Label><div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>{quoteOpts.map(q => <Chip key={q} active={q === quoteLength} onClick={() => setQuoteLength(q)}>{q}</Chip>)}</div></>)}
                    {mode === 'code' && (<><Label>Code language</Label><StyledSelect value={codeLanguage} onChange={e => setCodeLanguage(e.target.value)} options={codeLanguages} /></>)}
                  </>
                )}

                {drawer === 'options' && (
                  <>
                    {mode !== 'quote' && mode !== 'custom' && mode !== 'code' && (
                      <div style={{ marginBottom: 20 }}>
                        <Label>Modifiers</Label>
                        <div style={cardStyle}>
                          <ToggleRow label="Punctuation" tip="Add punctuation marks to words" value={punctuation} onChange={() => setPunctuation(!punctuation)} />
                          <ToggleRow label="Numbers" tip="Add random numbers to words" value={numbers} onChange={() => setNumbers(!numbers)} last />
                        </div>
                      </div>
                    )}
                    {mode !== 'custom' && mode !== 'code' && (
                      <>
                        <div style={{ marginBottom: 20 }}>
                          <Label>Language</Label>
                          <StyledSelect value={language} onChange={e => setLanguage(e.target.value)} options={languages} />
                        </div>
                        {mode !== 'quote' && (
                          <div style={{ marginBottom: 20 }}>
                            <Label>Difficulty</Label>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {['easy', 'medium', 'hard'].map(d => <Chip key={d} active={d === difficulty} onClick={() => setDifficulty(d)} tip={diffTips[d]}>{d}</Chip>)}
                            </div>
                          </div>
                        )}
                        <div>
                          <Label>Funbox</Label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {funboxOpts.map(f => <Chip key={f} active={funbox === f} onClick={() => setFunbox(f)} tip={funboxTips[f]}>{funboxLabels[f]}</Chip>)}
                          </div>
                        </div>
                      </>
                    )}
                    <div style={{ marginTop: 20 }}>
                      <ToggleRow label="Sound effects" tip="Toggle keyboard typing sounds" value={soundEnabled} onChange={onToggleSound} last />
                    </div>
                  </>
                )}

                {drawer === 'settings' && (
                  <>
                    <Label>Behavior</Label>
                    <div style={{ ...cardStyle, marginBottom: 20 }}>
                      <Row label="Stop on error" tip="Letter: can't type past a wrong char. Word: must fix word before pressing space."><CycleBtn value={stopOnError} options={['off', 'letter', 'word']} onChange={setStopOnError} /></Row>
                      <Row label="Confidence" tip="On: backspace disabled. Max: backspace disabled + must complete word correctly to advance."><CycleBtn value={confidenceMode} options={['off', 'on', 'max']} onChange={setConfidenceMode} /></Row>
                      <Row label="Blind mode" tip="No green/red feedback — characters stay untyped color. Type without visual crutches."><Switch value={blindMode} onChange={setBlindMode} /></Row>
                      <Row label="Freedom" tip="Backspace at start of a word jumps back to previous word so you can fix it."><Switch value={freedomMode} onChange={setFreedomMode} /></Row>
                      <Row label="Strict space" tip="Space is blocked unless every character in the word is typed correctly." last><Switch value={strictSpace} onChange={setStrictSpace} /></Row>
                    </div>

                    <Label>Challenge</Label>
                    <div style={{ ...cardStyle, marginBottom: 20 }}>
                      <Row label="Min WPM" tip="Test auto-fails if your speed drops below this threshold after 5 seconds."><NumInput value={minWpm} onChange={setMinWpm} placeholder="off" max={300} /></Row>
                      <Row label="Min accuracy" tip="Test auto-fails if your accuracy drops below this percentage."><NumInput value={minAccuracy} onChange={setMinAccuracy} placeholder="off" suffix="%" max={100} /></Row>
                      <Row label="Pace caret" tip="A ghost caret that moves at your target speed — visual pacer to train toward a goal." last={!paceCaretEnabled}><Switch value={paceCaretEnabled} onChange={setPaceCaretEnabled} /></Row>
                      {paceCaretEnabled && <Row label="Target WPM" tip="The speed (words per minute) at which the ghost pace caret moves." last><NumInput value={paceCaretSpeed} onChange={setPaceCaretSpeed} placeholder="60" min={10} max={300} /></Row>}
                    </div>

                    <Label>Display</Label>
                    <div style={cardStyle}>
                      <Row label="Font size" tip="1 = small, 2 = default, 3 = large, 4 = extra large. Changes the typing area text size.">
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1, 2, 3, 4].map(s => (
                            <button key={s} onClick={() => setFontSize(s)} title={`Size ${s}`}
                              style={{
                                width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                color: s === fontSize ? '#fff' : 'var(--t-sub)',
                                background: s === fontSize ? 'var(--t-accent)' : 'transparent',
                                border: s === fontSize ? '1px solid var(--t-accent)' : '1px solid var(--t-glass-border)',
                                transition: 'all 0.15s',
                              }}>{s}</button>
                          ))}
                        </div>
                      </Row>
                      <Row label="Speed unit" tip="WPM = words per minute (chars/5). CPM = raw characters per minute." last><CycleBtn value={speedUnit} options={['wpm', 'cpm']} onChange={setSpeedUnit} /></Row>
                    </div>
                  </>
                )}

                {drawer === 'theme' && (
                  <>
                    <Label>Choose theme</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {themes.map(t => (
                        <button key={t.id} onClick={() => { setTheme(t.id); setDrawer(null) }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                            fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                            color: theme === t.id ? 'var(--t-text)' : 'var(--t-sub)',
                            background: theme === t.id ? 'var(--t-glass-hover)' : 'transparent',
                          }}
                          onMouseEnter={e => { if (theme !== t.id) e.currentTarget.style.background = 'var(--t-glass)' }}
                          onMouseLeave={e => { if (theme !== t.id) e.currentTarget.style.background = 'transparent' }}>
                          <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.accent, flexShrink: 0, boxShadow: theme === t.id ? `0 0 8px ${t.accent}` : 'none' }} />
                          {t.name}
                          {theme === t.id && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--t-accent)' }}>Active</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ═══════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════ */

function NavBtn({ label, onClick, active, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 12px', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        color: active ? 'var(--t-text)' : 'var(--t-sub)',
        background: active ? 'var(--t-glass-hover)' : 'transparent',
        opacity: disabled ? 0.25 : 1, transition: 'all 0.15s', border: 'none',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = 'var(--t-text)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--t-sub)' }}
    >
      {label}
      <svg className="nav-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.4 }}>
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontWeight: 600, color: 'var(--t-accent)' }}>{children}</div>
}

function Row({ label, children, last, tip }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : '1px solid var(--t-divider)' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--t-text)' }}>{label}</div>
        {tip && <div style={{ fontSize: 10, color: 'var(--t-sub)', marginTop: 2, opacity: 0.7 }}>{tip}</div>}
      </div>
      {children}
    </div>
  )
}

function Sep() {
  return <span style={{ width: 1, height: 16, margin: '0 4px', flexShrink: 0, background: 'var(--t-nav-border)' }} />
}

function Chip({ children, active, onClick, tip }) {
  return (
    <button onClick={onClick} title={tip}
      style={{
        padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', textAlign: 'center',
        color: active ? '#fff' : 'var(--t-sub)',
        background: active ? 'var(--t-accent)' : 'var(--t-glass)',
        border: '1px solid ' + (active ? 'var(--t-accent)' : 'var(--t-glass-border)'),
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.background = 'var(--t-glass-hover)' }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--t-sub)'; e.currentTarget.style.background = 'var(--t-glass)' }}}
    >{children}</button>
  )
}

function StyledSelect({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange}
        style={{
          width: '100%', borderRadius: 10, padding: '10px 36px 10px 14px', fontSize: 13, fontWeight: 500,
          outline: 'none', cursor: 'pointer', appearance: 'none',
          background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)', color: 'var(--t-text)',
        }}>
        {(Array.isArray(options) ? options : []).map(o => (
          <option key={o} value={o} style={{ background: 'var(--t-option-bg)', color: 'var(--t-text)' }}>{o}</option>
        ))}
      </select>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--t-sub)' }}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}

function ToggleRow({ label, value, onChange, last, tip }) {
  return (
    <div title={tip} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : '1px solid var(--t-divider)', cursor: tip ? 'help' : undefined }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t-text)' }}>{label}</span>
      <Switch value={value} onChange={onChange} />
    </div>
  )
}

function IconBtn({ children, onClick, disabled, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} tabIndex={-1}
      style={{
        padding: 8, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        color: 'var(--t-sub)', background: 'transparent', border: 'none',
        opacity: disabled ? 0.25 : 1, transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.background = 'var(--t-glass)' }}}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--t-sub)'; e.currentTarget.style.background = 'transparent' }}
    >{children}</button>
  )
}

function CycleBtn({ value, options, onChange }) {
  const next = () => { const i = options.indexOf(value); onChange(options[(i + 1) % options.length]) }
  const on = value !== options[0]
  return (
    <button onClick={next} title={`Click to cycle: ${options.join(' → ')}`}
      style={{
        fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '5px 12px', borderRadius: 6, minWidth: 44, textAlign: 'center',
        color: on ? '#fff' : 'var(--t-sub)', background: on ? 'var(--t-accent)' : 'var(--t-glass)',
        border: '1px solid ' + (on ? 'var(--t-accent)' : 'var(--t-glass-border)'), transition: 'all 0.15s',
      }}>{value}</button>
  )
}

function Switch({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} title={value ? 'Enabled — click to disable' : 'Disabled — click to enable'}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative', flexShrink: 0,
        background: value ? 'var(--t-accent)' : 'var(--t-dim)', border: 'none', transition: 'all 0.2s',
      }}>
      <span style={{
        position: 'absolute', top: 2, width: 16, height: 16, borderRadius: 8,
        background: '#fff', transition: 'all 0.2s',
        left: value ? 'calc(100% - 18px)' : 2,
        opacity: value ? 1 : 0.5, boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }} />
    </button>
  )
}

function NumInput({ value, onChange, placeholder, suffix, min = 0, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input type="number" value={value || ''} placeholder={placeholder} min={min} max={max}
        onChange={e => {
          let v = parseInt(e.target.value) || 0
          v = Math.max(min, v)
          if (max !== undefined) v = Math.min(max, v)
          onChange(v)
        }}
        style={{
          width: 52, textAlign: 'right', background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)',
          borderRadius: 6, padding: '5px 8px', fontSize: 12, fontWeight: 500, outline: 'none',
          color: value > 0 ? 'var(--t-text)' : 'var(--t-sub)',
        }} />
      {suffix && <span style={{ fontSize: 10, color: 'var(--t-sub)' }}>{suffix}</span>}
    </div>
  )
}
