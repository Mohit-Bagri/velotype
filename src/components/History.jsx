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

export default function History({ onBack }) {
  const c = useThemeColors()
  const [history, setHistory] = useState([])

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('velotype-history') || '[]')
    setHistory(h.reverse()) // newest first
  }, [])

  const chartData = [...history].reverse().map((h, i) => ({
    test: i + 1,
    wpm: h.wpm,
    accuracy: h.accuracy,
  }))

  const bestWpm = history.length > 0 ? Math.max(...history.map(h => h.wpm)) : 0
  const avgWpm = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.wpm, 0) / history.length) : 0
  const avgAcc = history.length > 0 ? Math.round(history.reduce((a, h) => a + h.accuracy, 0) / history.length) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-[1000px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--t-text)' }}>History</h1>
          <p className="text-[12px] mt-1" style={{ color: 'var(--t-sub)' }}>{history.length} tests recorded</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors"
          style={{ color: 'var(--t-sub)', border: '1px solid var(--t-glass-border)' }}
        >
          Back to test
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--t-sub)' }}>
          <p className="text-lg mb-2">No tests yet</p>
          <p className="text-[12px]">Complete a typing test to see your history here</p>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatBox label="Best WPM" value={bestWpm} c={c} />
            <StatBox label="Average WPM" value={avgWpm} c={c} />
            <StatBox label="Average Accuracy" value={`${avgAcc}%`} c={c} />
          </div>

          {/* Chart */}
          <div className="mb-8 rounded-xl p-6" style={{ background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)' }}>
            <div className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: c.sub }}>Performance Over Time</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid stroke={c.grid} vertical={false} />
                <XAxis dataKey="test" stroke="transparent" tick={{ fontSize: 11, fill: c.sub }} tickLine={false} />
                <YAxis stroke="transparent" tick={{ fontSize: 11, fill: c.sub }} tickLine={false} width={35} />
                <Tooltip
                  contentStyle={{
                    background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`,
                    borderRadius: 8, fontSize: 12,
                  }}
                  labelFormatter={v => `Test #${v}`}
                />
                <Line type="monotone" dataKey="wpm" stroke={c.accent} strokeWidth={2} dot={{ r: 3, fill: c.accent }} name="WPM" />
                <Line type="monotone" dataKey="accuracy" stroke={c.correct} strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent tests table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--t-glass-border)' }}>
            <div className="px-6 py-3" style={{ background: 'var(--t-glass)' }}>
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: c.sub }}>Recent Tests</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--t-divider)' }}>
              {history.slice(0, 20).map((h, i) => (
                <div key={i} className="grid grid-cols-5 px-6 py-3 text-[13px]" style={{ borderColor: 'var(--t-divider)' }}>
                  <span className="text-accent font-semibold tabular-nums">{h.wpm} wpm</span>
                  <span style={{ color: h.accuracy >= 95 ? c.correct : h.accuracy >= 80 ? c.sub : c.err }}>{h.accuracy}%</span>
                  <span style={{ color: c.sub }}>{h.mode}</span>
                  <span style={{ color: c.sub }}>{h.language}</span>
                  <span className="text-right" style={{ color: c.sub }}>
                    {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clear history */}
          <div className="text-center mt-6">
            <button
              onClick={() => { localStorage.removeItem('velotype-history'); setHistory([]) }}
              className="text-[11px] cursor-pointer transition-colors"
              style={{ color: 'var(--t-sub)' }}
            >
              Clear history
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

function StatBox({ label, value, c }) {
  return (
    <div className="rounded-xl py-5 text-center" style={{ background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)' }}>
      <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: c.sub }}>{label}</div>
      <div className="text-2xl font-bold tabular-nums text-accent">{value}</div>
    </div>
  )
}
