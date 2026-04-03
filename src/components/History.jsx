import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function v(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() }

function useThemeColors() {
  const [c, setC] = useState(read)
  useEffect(() => {
    const obs = new MutationObserver(() => setC(read()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return c
}

function read() {
  return {
    accent: v('--t-accent'), sub: v('--t-sub'), text: v('--t-text'),
    grid: v('--t-chart-grid'), err: v('--t-error'), correct: v('--t-success'),
    tooltipBg: v('--t-tooltip-bg'), tooltipBorder: v('--t-tooltip-border'),
    divider: v('--t-divider'),
  }
}

const glass = { background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)', borderRadius: 16 }

const PAGE_SIZE = 10

export default function History({ onBack }) {
  const c = useThemeColors()
  const [history, setHistory] = useState([])
  const [page, setPage] = useState(0)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('velotype-history') || '[]')
    setHistory(h.reverse())
  }, [])

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE))
  const pageData = history.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const chartData = [...history].reverse().map((h, i) => ({
    test: i + 1, wpm: h.wpm, accuracy: h.accuracy,
  }))

  const bestWpm = history.length > 0 ? Math.max(...history.map(h => h.wpm)) : 0
  const avgWpm = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.wpm, 0) / history.length) : 0
  const avgAcc = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.accuracy, 0) / history.length) : 0
  const bestAcc = history.length > 0 ? Math.max(...history.map(h => h.accuracy)) : 0
  const totalTests = history.length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full max-w-[1100px] mx-auto px-3 sm:px-4">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t-text)' }}>History</h1>
          <p style={{ fontSize: 12, marginTop: 4, color: 'var(--t-sub)' }}>
            {totalTests} test{totalTests !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button onClick={onBack}
          style={{
            fontSize: 12, cursor: 'pointer', padding: '8px 16px', borderRadius: 10,
            color: 'var(--t-sub)', background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--t-text)'; e.currentTarget.style.borderColor = 'var(--t-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--t-sub)'; e.currentTarget.style.borderColor = 'var(--t-glass-border)' }}
        >Back to test</button>
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--t-sub)' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No tests yet</p>
          <p style={{ fontSize: 12 }}>Complete a typing test to see your history here</p>
        </div>
      ) : (
        <>
          {/* Stats row — responsive: 2 cols mobile, 3 cols tablet, 5 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-5">
            <OverviewCard label="Best WPM" value={bestWpm} c={c} />
            <OverviewCard label="Avg WPM" value={avgWpm} c={c} />
            <OverviewCard label="Best Acc" value={`${bestAcc}%`} c={c} />
            <OverviewCard label="Avg Acc" value={`${avgAcc}%`} c={c} />
            <OverviewCard label="Tests" value={totalTests} c={c} className="col-span-2 sm:col-span-1" />
          </div>

          {/* Chart */}
          <div style={{ ...glass, padding: '16px 12px', marginBottom: 20 }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, color: c.sub, fontWeight: 600, paddingLeft: 8 }}>
              Performance Over Time
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="test" stroke="transparent" tick={{ fontSize: 10, fill: c.sub }} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fontSize: 10, fill: c.sub }} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 10, fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                  labelFormatter={v => `Test #${v}`}
                />
                <Line type="monotone" dataKey="wpm" stroke={c.accent} strokeWidth={2} dot={{ r: 2, fill: c.accent }} name="WPM" />
                <Line type="monotone" dataKey="accuracy" stroke={c.correct} strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table — horizontal scroll on mobile */}
          <div style={{ ...glass, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 600 }}>
                {/* Table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.2fr', padding: '10px 16px',
                  fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                  background: 'var(--t-glass)', color: c.sub,
                }}>
                  <span>wpm</span><span>raw</span><span>acc</span><span>cons</span>
                  <span>mode</span><span>lang</span><span>time</span><span style={{ textAlign: 'right' }}>date</span>
                </div>
                {/* Table rows */}
                {pageData.map((h, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1.2fr', padding: '10px 16px',
                    fontSize: 12, borderTop: `1px solid ${c.divider}`,
                  }}>
                    <span style={{ color: 'var(--t-accent)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{h.wpm}</span>
                    <span style={{ color: c.sub, fontVariantNumeric: 'tabular-nums' }}>{h.rawWpm || '-'}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: h.accuracy >= 95 ? c.correct : h.accuracy >= 80 ? c.text : c.err }}>
                      {h.accuracy}%
                    </span>
                    <span style={{ color: c.sub, fontVariantNumeric: 'tabular-nums' }}>{h.consistency != null ? `${h.consistency}%` : '-'}</span>
                    <span style={{ color: c.sub }}>{h.mode}</span>
                    <span style={{ color: c.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.language}</span>
                    <span style={{ color: c.sub, fontVariantNumeric: 'tabular-nums' }}>{h.duration}s</span>
                    <span style={{ textAlign: 'right', color: c.sub, fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <PagBtn onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</PagBtn>
              <span style={{ fontSize: 11, color: 'var(--t-sub)', fontVariantNumeric: 'tabular-nums' }}>{page + 1} / {totalPages}</span>
              <PagBtn onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</PagBtn>
            </div>
          )}

          {/* Clear */}
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            {confirmClear ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--t-error)' }}>Delete all history?</span>
                <button onClick={() => { localStorage.removeItem('velotype-history'); setHistory([]); setPage(0); setConfirmClear(false) }}
                  style={{ fontSize: 11, cursor: 'pointer', color: '#fff', background: 'var(--t-error)', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600 }}
                >Yes, clear</button>
                <button onClick={() => setConfirmClear(false)}
                  style={{ fontSize: 11, cursor: 'pointer', color: 'var(--t-sub)', background: 'none', border: '1px solid var(--t-glass-border)', borderRadius: 6, padding: '4px 12px' }}
                >Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)}
                style={{ fontSize: 11, cursor: 'pointer', color: 'var(--t-sub)', background: 'none', border: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--t-error)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}
              >Clear history</button>
            )}
          </div>
        </>
      )}

      {/* Branding */}
      <div style={{ textAlign: 'center', padding: '40px 0 32px', fontSize: 11, color: 'var(--t-sub)' }}>
        <span>Made in 🇮🇳 with ❤️ by </span>
        <a href="https://mohitbagri-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MOHIT BAGRI</a>
        <span style={{ margin: '0 12px', opacity: 0.3 }}>|</span>
        <span>⭐ </span>
        <a href="https://github.com/Mohit-Bagri/velotype" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Star on GitHub</a>
      </div>
    </motion.div>
  )
}

function OverviewCard({ label, value, c, className }) {
  return (
    <div className={className} style={{ ...glass, padding: '14px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, color: c.sub, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--t-accent)' }}>{value}</div>
    </div>
  )
}

function PagBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        fontSize: 12, padding: '6px 14px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        color: 'var(--t-sub)', background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)',
        opacity: disabled ? 0.3 : 1, transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = 'var(--t-text)' }}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}
    >{children}</button>
  )
}
