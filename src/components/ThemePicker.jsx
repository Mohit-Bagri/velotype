import { useState, useRef, useEffect } from 'react'

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

export default function ThemePicker({ current, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        className="transition-colors cursor-pointer p-2 rounded-full"
        style={{ color: 'var(--t-sub)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--t-text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}
        title="Change theme"
        tabIndex={-1}
        disabled={disabled}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 rounded-xl overflow-hidden"
          style={{
            background: 'var(--t-nav-bg)',
            border: '1px solid var(--t-nav-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            minWidth: 160,
            zIndex: 50,
          }}
        >
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => { onChange(t.id); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors"
              style={{
                color: current === t.id ? 'var(--t-text)' : 'var(--t-sub)',
                background: current === t.id ? 'var(--t-glass-hover)' : 'transparent',
              }}
              onMouseEnter={e => { if (current !== t.id) e.target.style.background = 'var(--t-glass)' }}
              onMouseLeave={e => { if (current !== t.id) e.target.style.background = 'transparent' }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: t.accent,
                  flexShrink: 0,
                  boxShadow: current === t.id ? `0 0 8px ${t.accent}` : 'none',
                }}
              />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
