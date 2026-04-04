import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function v(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim() }

function useThemeColors() {
  const [colors, setColors] = useState(() => readColors())
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return colors
}

function readColors() {
  return {
    accent: v('--t-accent'),
    sub: v('--t-sub'),
    raw: v('--t-raw'),
    err: v('--t-error'),
    correct: v('--t-success'),
    grid: v('--t-chart-grid'),
    divider: v('--t-divider'),
    tooltipBg: v('--t-tooltip-bg'),
    tooltipBorder: v('--t-tooltip-border'),
    text: v('--t-text'),
    bgSurface: v('--t-bg'),
    glass: v('--t-glass'),
    glassBorder: v('--t-glass-border'),
  }
}

const glass = { background: 'var(--t-glass)', border: '1px solid var(--t-glass-border)', borderRadius: 16 }

function ChartTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null
  const c = colors || readColors()
  const d = payload[0]?.payload || {}
  return (
    <div style={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 12, padding: '12px 16px', fontSize: 12, minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ color: c.text, fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <TipRow color={c.err} label="errors" val={d.err || 0} textColor={c.sub} valColor={c.text} />
        <TipRow color={c.accent} label="wpm" val={d.wpm || 0} textColor={c.sub} valColor={c.text} />
        <TipRow color={c.raw} label="raw" val={d.raw || 0} textColor={c.sub} valColor={c.text} />
      </div>
    </div>
  )
}

function TipRow({ color, label, val, textColor, valColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ color: textColor, flex: 1 }}>{label}:</span>
      <span style={{ color: valColor, fontWeight: 500 }}>{val}</span>
    </div>
  )
}

export default function Results({
  stats, duration, mode, language, punctuation, numbers, wordCount, difficulty,
  speedUnit = 'wpm', failReason,
}) {
  const c = useThemeColors()

  // ALL hooks must be called before any early return (Rules of Hooks)
  const isPB = useMemo(() => {
    if (!stats || failReason || stats.suspicious || !stats.wpm) return false
    const history = JSON.parse(localStorage.getItem('velotype-history') || '[]')
    if (history.length === 0) return true
    const prevBest = Math.max(...history.map(h => h.wpm))
    return stats.wpm > prevBest
  }, [stats, failReason])

  if (!stats) return null

  const isCpm = speedUnit === 'cpm'
  const displayWpm = isCpm ? stats.wpm * 5 : stats.wpm
  const displayRawWpm = isCpm ? stats.rawWpm * 5 : stats.rawWpm
  const unitLabel = isCpm ? 'cpm' : 'wpm'

  const wpmHist = stats.wpmHistory || []
  const rawHist = stats.rawWpmHistory || []
  const errHist = stats.errorHistory || []

  const data = wpmHist.map((wpm, i) => ({
    t: i + 1,
    wpm: isCpm ? wpm * 5 : wpm,
    raw: isCpm ? (rawHist[i] || 0) * 5 : (rawHist[i] || 0),
    err: errHist[i] || 0,
  }))
  const maxWpm = data.length > 0 ? Math.max(...data.map(d => Math.max(d.wpm, d.raw)), 10) : 10
  const yMax = Math.ceil(maxWpm / 20) * 20 + 10

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full">
      {/* Banners */}
      {failReason && (
        <div style={{ textAlign: 'center', marginBottom: 24, padding: '14px 24px', borderRadius: 14, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.err }}>Test Failed</div>
          <div style={{ fontSize: 11, marginTop: 4, color: c.sub }}>{failReason}</div>
        </div>
      )}
      {isPB && !failReason && (
        <div style={{ textAlign: 'center', marginBottom: 24, padding: '14px 24px', borderRadius: 14, background: 'var(--t-accent-soft)', border: '1px solid var(--t-accent)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>&#x1F451;</span> New Personal Best!
          </div>
        </div>
      )}

      {/* ── Main: Stats + Chart ── */}
      <div style={{ ...glass, padding: 24, marginBottom: 20 }}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left stats */}
          <div className="flex md:flex-col justify-center gap-8 md:gap-0 shrink-0 md:min-w-[140px]">
            <div className="md:mb-6">
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 6, color: c.sub }}>{unitLabel}</div>
              <div style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--t-accent)' }}>{displayWpm}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 6, color: c.sub }}>acc</div>
              <div style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'var(--t-accent)' }}>{stats.accuracy}%</div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-w-0 flex">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, flexShrink: 0, marginRight: -2, alignSelf: 'stretch' }}>
              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', color: c.sub, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {isCpm ? 'Chars per Min' : 'Words per Min'}
              </div>
            </div>
            <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c.accent} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={c.grid} vertical={false} />
                  <XAxis dataKey="t" stroke="transparent" tick={{ fontSize: 10, fill: c.sub }} tickLine={false} axisLine={false} label={{ value: 'Seconds', position: 'insideBottom', offset: -5, style: { fontSize: 8, fill: c.sub, textTransform: 'uppercase', letterSpacing: '0.12em' } }} />
                  <YAxis yAxisId="w" stroke="transparent" tick={{ fontSize: 10, fill: c.sub }} tickLine={false} axisLine={false} width={30} domain={[0, yMax]} allowDecimals={false} />
                  <YAxis yAxisId="e" orientation="right" stroke="transparent" tick={{ fontSize: 10, fill: c.sub }} tickLine={false} axisLine={false} width={25} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip colors={c} />} cursor={{ stroke: c.divider, strokeWidth: 1 }} />
                  <Area yAxisId="w" type="monotone" dataKey="wpm" stroke={c.accent} strokeWidth={2} fill="url(#wg)" dot={false} activeDot={{ r: 4, fill: c.accent, stroke: c.bgSurface, strokeWidth: 2 }} />
                  <Line yAxisId="w" type="monotone" dataKey="raw" stroke={c.raw} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line yAxisId="e" type="stepAfter" dataKey="err" stroke="transparent" dot={p => {
                    if (!p.payload || p.payload.err <= 0) return null
                    return <svg key={p.index} x={p.cx-5} y={p.cy-6} width={10} height={12}><text x={5} y={10} textAnchor="middle" fill={c.err} fontSize={11} fontWeight="bold">x</text></svg>
                  }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center shrink-0" style={{ width: 14, marginLeft: -2 }}>
              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap', color: c.sub, writingMode: 'vertical-rl' }}>Errors</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Details grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="test type" c={c}>
          <div style={{ color: 'var(--t-accent)', fontSize: 14, fontWeight: 600 }}>
            {mode}{mode === 'time' ? ` ${duration}s` : mode === 'words' ? ` ${wordCount}` : ''}
          </div>
          <div style={{ color: c.sub, fontSize: 11, marginTop: 2 }}>
            {mode !== 'custom' && mode !== 'code' && language}
            {mode !== 'quote' && mode !== 'custom' && mode !== 'code' && ` ${difficulty}`}
          </div>
        </StatCard>
        <StatCard label={`raw ${unitLabel}`} c={c}>
          <span style={{ color: 'var(--t-text)', fontSize: 18, fontWeight: 600 }}>{displayRawWpm}</span>
        </StatCard>
        <StatCard label="characters" c={c}>
          <div title={`${stats.correct} correct / ${stats.incorrect} incorrect / ${stats.missed} missed / ${stats.totalChars} total`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 14, fontWeight: 600, cursor: 'help' }}>
            <span title="Correct" style={{ color: c.correct }}>{stats.correct}</span>
            <span style={{ color: c.sub, opacity: 0.4 }}>/</span>
            <span title="Incorrect" style={{ color: c.err }}>{stats.incorrect}</span>
            <span style={{ color: c.sub, opacity: 0.4 }}>/</span>
            <span title="Missed" style={{ color: c.sub }}>{stats.missed}</span>
            <span style={{ color: c.sub, opacity: 0.4 }}>/</span>
            <span title="Total" style={{ color: c.sub }}>{stats.totalChars}</span>
          </div>
          <div style={{ fontSize: 9, marginTop: 4, color: c.sub, opacity: 0.5, textAlign: 'center' }}>
            hover for details
          </div>
        </StatCard>
        <StatCard label="consistency" c={c}>
          <span style={{ color: 'var(--t-text)', fontSize: 18, fontWeight: 600 }}>{stats.consistency}%</span>
        </StatCard>
        <StatCard label="burst" c={c}>
          <span style={{ color: 'var(--t-text)', fontSize: 18, fontWeight: 600 }}>{isCpm ? stats.avgBurst * 5 : stats.avgBurst}</span>
          {stats.maxBurst > 0 && <div style={{ fontSize: 10, color: c.sub, marginTop: 2 }}>{isCpm ? stats.minBurst * 5 : stats.minBurst}–{isCpm ? stats.maxBurst * 5 : stats.maxBurst}</div>}
        </StatCard>
        <StatCard label="time" c={c}>
          <span style={{ color: 'var(--t-text)', fontSize: 18, fontWeight: 600 }}>{stats.elapsedSeconds || duration}s</span>
        </StatCard>
      </div>

      {/* ── Keypress timing ── */}
      {stats.avgKeypressTime > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 300, margin: '0 auto 20px' }}>
          <StatCard label="key spacing" c={c}>
            <span style={{ color: 'var(--t-text)', fontSize: 16, fontWeight: 600 }}>{stats.avgKeypressTime}ms</span>
            <div style={{ fontSize: 9, color: c.sub, marginTop: 2 }}>avg</div>
          </StatCard>
          <StatCard label="key deviation" c={c}>
            <span style={{ color: 'var(--t-text)', fontSize: 16, fontWeight: 600 }}>{stats.keypressStdDev}ms</span>
            <div style={{ fontSize: 9, color: c.sub, marginTop: 2 }}>std dev</div>
          </StatCard>
        </div>
      )}

      {/* Shortcut */}
      <div className="text-center" style={{ marginTop: 28 }}>
        <span className="tip-glow text-[11px] tracking-wider">
          <kbd className="glass rounded px-1.5 py-0.5 text-[10px] mx-0.5">esc</kbd>
          <span className="ml-1.5">- new test</span>
        </span>
      </div>
    </motion.div>
  )
}

function StatCard({ label, children, c }) {
  return (
    <div style={{ ...glass, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6, color: c.sub, fontWeight: 600 }}>{label}</div>
      <div style={{ fontVariantNumeric: 'tabular-nums' }}>{children}</div>
    </div>
  )
}

