import { useState, useEffect } from 'react'
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

const PAGE_SIZE = 10

export default function History({ onBack }) {
  const c = useThemeColors()
  const [history, setHistory] = useState([])
  const [page, setPage] = useState(0)

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-[1100px] mx-auto px-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--t-text)' }}>History</h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--t-sub)' }}>
            {totalTests} test{totalTests !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-[12px] cursor-pointer transition-colors px-4 py-2 rounded-lg"
          style={{ color: 'var(--t-sub)', border: '1px solid var(--t-glass-border)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--t-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}
        >
          Back to test
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--t-sub)' }}>
          <p className="text-base mb-2">No tests yet</p>
          <p className="text-[12px]">Complete a typing test to see your history here</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <StatBox label="Best WPM" value={bestWpm} c={c} />
            <StatBox label="Avg WPM" value={avgWpm} c={c} />
            <StatBox label="Best Acc" value={`${bestAcc}%`} c={c} />
            <StatBox label="Avg Acc" value={`${avgAcc}%`} c={c} />
            <StatBox label="Tests" value={totalTests} c={c} />
          </div>

          {/* Chart */}
          <div className="mb-6 rounded-xl p-5" style={{ background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)' }}>
            <div className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: c.sub }}>Performance Over Time</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="test" stroke="transparent" tick={{ fontSize: 10, fill: c.sub }} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fontSize: 10, fill: c.sub }} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`,
                    borderRadius: 8, fontSize: 12,
                  }}
                  labelFormatter={v => `Test #${v}`}
                />
                <Line type="monotone" dataKey="wpm" stroke={c.accent} strokeWidth={2} dot={{ r: 2.5, fill: c.accent }} name="WPM" />
                <Line type="monotone" dataKey="accuracy" stroke={c.correct} strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--t-glass-border)' }}>
            {/* Header */}
            <div className="grid grid-cols-8 px-5 py-2.5 text-[9px] uppercase tracking-[0.15em]" style={{ background: 'var(--t-glass)', color: c.sub }}>
              <span>wpm</span>
              <span>raw</span>
              <span>accuracy</span>
              <span>consistency</span>
              <span>mode</span>
              <span>language</span>
              <span>duration</span>
              <span className="text-right">date</span>
            </div>
            {/* Rows */}
            {pageData.map((h, i) => (
              <div key={i} className="grid grid-cols-8 px-5 py-2 text-[12px]" style={{ borderTop: `1px solid ${c.divider}` }}>
                <span className="text-accent font-semibold tabular-nums">{h.wpm}</span>
                <span className="tabular-nums" style={{ color: c.sub }}>{h.rawWpm || '-'}</span>
                <span className="tabular-nums" style={{ color: h.accuracy >= 95 ? c.correct : h.accuracy >= 80 ? c.text : c.err }}>
                  {h.accuracy}%
                </span>
                <span className="tabular-nums" style={{ color: c.sub }}>{h.consistency != null ? `${h.consistency}%` : '-'}</span>
                <span style={{ color: c.sub }}>{h.mode}</span>
                <span style={{ color: c.sub }}>{h.language}</span>
                <span className="tabular-nums" style={{ color: c.sub }}>{h.duration}s</span>
                <span className="text-right tabular-nums" style={{ color: c.sub }}>
                  {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-[12px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--t-sub)', border: '1px solid var(--t-glass-border)' }}
              >
                Prev
              </button>
              <span className="text-[11px] tabular-nums" style={{ color: 'var(--t-sub)' }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="text-[12px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--t-sub)', border: '1px solid var(--t-glass-border)' }}
              >
                Next
              </button>
            </div>
          )}

          {/* Clear */}
          <div className="text-center py-4">
            <button
              onClick={() => { localStorage.removeItem('velotype-history'); setHistory([]); setPage(0) }}
              className="text-[11px] cursor-pointer transition-colors"
              style={{ color: 'var(--t-sub)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--t-error, var(--t-err))'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t-sub)'}
            >
              Clear history
            </button>
          </div>
        </>
      )}

      {/* Branding */}
      <div className="text-center py-8 text-[11px]" style={{ color: 'var(--t-sub)' }}>
        <span>Made in 🇮🇳 with ❤️ by </span>
        <a href="https://mohitbagri-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MOHIT BAGRI</a>
        <span className="mx-2">|</span>
        <a href="https://github.com/Mohit-Bagri/velotype" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--t-sub)' }}>
          ⭐ Star on GitHub
        </a>
      </div>
    </motion.div>
  )
}

function StatBox({ label, value, c }) {
  return (
    <div className="rounded-xl py-4 text-center" style={{ background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)' }}>
      <div className="text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ color: c.sub }}>{label}</div>
      <div className="text-xl font-bold tabular-nums text-accent">{value}</div>
    </div>
  )
}
