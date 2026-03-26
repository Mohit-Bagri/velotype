import { useState, useEffect } from 'react'
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
  }
}

function ChartTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null
  const c = colors || readColors()
  const d = payload[0]?.payload || {}
  return (
    <div style={{
      background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`,
      borderRadius: 8, padding: '12px 16px', fontSize: 12, minWidth: 140,
    }}>
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

export default function Results({ stats, duration, mode, language, punctuation, numbers, wordCount }) {
  const c = useThemeColors()
  if (!stats) return null

  const data = stats.wpmHistory.map((wpm, i) => ({
    t: i + 1, wpm, raw: stats.rawWpmHistory[i] || 0, err: stats.errorHistory[i] || 0,
  }))
  const maxWpm = Math.max(...data.map(d => Math.max(d.wpm, d.raw)), 10)
  const yMax = Math.ceil(maxWpm / 20) * 20 + 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* ── Top section: Stats left + Chart right ── */}
      <div className="flex gap-8 mb-6">
        {/* Left stats column */}
        <div className="flex flex-col justify-center shrink-0" style={{ minWidth: 160 }}>
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: c.sub }}>wpm</div>
            <div className="text-[3.5rem] font-bold leading-none tabular-nums text-accent">{stats.wpm}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: c.sub }}>acc</div>
            <div className="text-[3.5rem] font-bold leading-none tabular-nums text-accent">{stats.accuracy}%</div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 5, right: 45, left: 15, bottom: 5 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.accent} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={c.grid} vertical={false} />
              <XAxis dataKey="t" stroke="transparent" tick={{ fontSize: 11, fill: c.sub }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="w" stroke="transparent" tick={{ fontSize: 11, fill: c.sub }} tickLine={false} axisLine={false} width={40} domain={[0, yMax]} allowDecimals={false} label={{ value: 'wpm', position: 'top', offset: 8, style: { fontSize: 9, fill: c.sub, textTransform: 'uppercase', letterSpacing: '0.1em' } }} />
              <YAxis yAxisId="e" orientation="right" stroke="transparent" tick={{ fontSize: 11, fill: c.sub }} tickLine={false} axisLine={false} width={35} allowDecimals={false} label={{ value: 'errors', position: 'top', offset: 8, style: { fontSize: 9, fill: c.sub, textTransform: 'uppercase', letterSpacing: '0.1em' } }} />
              <Tooltip content={<ChartTooltip colors={c} />} cursor={{ stroke: c.dim, strokeWidth: 1 }} />
              <Area yAxisId="w" type="monotone" dataKey="wpm" name="WPM" stroke={c.accent} strokeWidth={2} fill="url(#wg)" dot={false} activeDot={{ r: 4, fill: c.accent, stroke: c.bgSurface, strokeWidth: 2 }} />
              <Line yAxisId="w" type="monotone" dataKey="raw" name="Raw" stroke={c.raw} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line yAxisId="e" type="stepAfter" dataKey="err" name="Errors" stroke="transparent" dot={p => {
                if (!p.payload || p.payload.err <= 0) return null
                return <svg key={p.index} x={p.cx-5} y={p.cy-6} width={10} height={12}><text x={5} y={10} textAnchor="middle" fill={c.err} fontSize={11} fontWeight="bold">x</text></svg>
              }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="h-px" style={{ background: c.divider }} />

      {/* ── Details row ── */}
      <div className="grid grid-cols-5 py-6 px-2">
        <DetailBlock label="test type" subColor={c.sub}>
          <div className="text-accent leading-relaxed">
            {mode} {mode === 'time' ? duration : wordCount}
            {punctuation && <span style={{ color: c.sub }}> punctuation</span>}
            {numbers && <span style={{ color: c.sub }}> numbers</span>}
          </div>
          <div style={{ color: c.sub }}>{language}</div>
        </DetailBlock>
        <DetailBlock label="raw" subColor={c.sub}>
          <span className="text-text">{stats.rawWpm}</span>
        </DetailBlock>
        <DetailBlock label="characters" center subColor={c.sub}>
          <div className="flex items-center justify-center gap-1">
            <span style={{ color: c.correct }}>{stats.correct}</span>
            <span style={{ color: c.dim }}>/</span>
            <span style={{ color: c.err }}>{stats.incorrect}</span>
            <span style={{ color: c.dim }}>/</span>
            <span style={{ color: c.sub }}>{stats.missed}</span>
            <span style={{ color: c.dim }}>/</span>
            <span style={{ color: c.sub }}>{stats.totalChars}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-[9px] mt-1" style={{ color: c.sub }}>
            <span>correct</span>
            <span>/</span>
            <span>incorrect</span>
            <span>/</span>
            <span>missed</span>
            <span>/</span>
            <span>total</span>
          </div>
        </DetailBlock>
        <DetailBlock label="consistency" center subColor={c.sub}>
          <span className="text-text">{stats.consistency}%</span>
        </DetailBlock>
        <DetailBlock label="time" right subColor={c.sub}>
          <span className="text-text">{stats.elapsedSeconds || duration}s</span>
        </DetailBlock>
      </div>

      {/* ── Tip ── */}
      <div className="text-center mt-6">
        <span className="tip-glow text-[11px] tracking-wider">
          tip: press <kbd className="glass rounded px-1.5 py-0.5 text-[10px] mx-0.5">esc</kbd> to restart
        </span>
      </div>
    </motion.div>
  )
}

function DetailBlock({ label, children, center, right, subColor }) {
  return (
    <div className={center ? 'text-center' : right ? 'text-right' : ''}>
      <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: subColor }}>{label}</div>
      <div className="text-[1.1rem] font-semibold tabular-nums">{children}</div>
    </div>
  )
}
