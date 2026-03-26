import { motion } from 'framer-motion'
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const accent = '#8b5cf6'
const sub = 'rgba(255,255,255,0.18)'
const raw = 'rgba(255,255,255,0.35)'
const err = '#f87171'
const correct = '#a3e635'
const grid = 'rgba(255,255,255,0.04)'
const divider = 'rgba(255,255,255,0.05)'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload || {}
  return (
    <div style={{
      background: 'rgba(5,5,10,0.95)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '12px 16px', fontSize: 12, minWidth: 140,
    }}>
      <div style={{ color: '#fff', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <TipRow color={err} label="errors" val={d.err || 0} />
        <TipRow color={accent} label="wpm" val={d.wpm || 0} />
        <TipRow color={raw} label="raw" val={d.raw || 0} />
      </div>
    </div>
  )
}

function TipRow({ color, label, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ color: 'rgba(255,255,255,0.5)', flex: 1 }}>{label}:</span>
      <span style={{ color: '#fff', fontWeight: 500 }}>{val}</span>
    </div>
  )
}

export default function Results({ stats, duration, mode, language, punctuation, numbers, wordCount }) {
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
            <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: sub }}>wpm</div>
            <div className="text-[3.5rem] font-bold leading-none tabular-nums text-accent">{stats.wpm}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] mb-2" style={{ color: sub }}>acc</div>
            <div className="text-[3.5rem] font-bold leading-none tabular-nums text-accent">{stats.accuracy}%</div>
          </div>
        </div>

        {/* Chart with vertical axis labels */}
        <div className="flex-1 min-w-0 flex">
          {/* Left vertical label */}
          <div className="flex items-center shrink-0" style={{ width: 18 }}>
            <span className="text-[9px] uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: sub, transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
              Words per Minute
            </span>
          </div>

          {/* Chart area */}
          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data} margin={{ top: 5, right: 35, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis dataKey="t" stroke="transparent" tick={{ fontSize: 11, fill: sub }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="w" stroke="transparent" tick={{ fontSize: 11, fill: sub }} tickLine={false} axisLine={false} width={35} domain={[0, yMax]} allowDecimals={false} />
                <YAxis yAxisId="e" orientation="right" stroke="transparent" tick={{ fontSize: 11, fill: sub }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                <Area yAxisId="w" type="monotone" dataKey="wpm" name="WPM" stroke={accent} strokeWidth={2} fill="url(#wg)" dot={false} activeDot={{ r: 4, fill: accent, stroke: '#0f0f14', strokeWidth: 2 }} />
                <Line yAxisId="w" type="monotone" dataKey="raw" name="Raw" stroke={raw} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line yAxisId="e" type="stepAfter" dataKey="err" name="Errors" stroke="transparent" dot={p => {
                  if (!p.payload || p.payload.err <= 0) return null
                  return <svg key={p.index} x={p.cx-5} y={p.cy-6} width={10} height={12}><text x={5} y={10} textAnchor="middle" fill={err} fontSize={11} fontWeight="bold">x</text></svg>
                }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Right vertical label */}
          <div className="flex items-center shrink-0" style={{ width: 18 }}>
            <span className="text-[9px] uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: sub, transform: 'rotate(90deg)', transformOrigin: 'center' }}>
              Errors
            </span>
          </div>
        </div>
      </div>

      <div className="h-px" style={{ background: divider }} />

      {/* ── Details row ── */}
      <div className="grid grid-cols-5 py-6 px-2">
        <DetailBlock label="test type">
          <div className="text-accent leading-relaxed">
            {mode} {mode === 'time' ? duration : wordCount}
            {punctuation && <span className="text-neutral-400"> punctuation</span>}
            {numbers && <span className="text-neutral-400"> numbers</span>}
          </div>
          <div className="text-neutral-500">{language}</div>
        </DetailBlock>
        <DetailBlock label="raw">
          <span className="text-text">{stats.rawWpm}</span>
        </DetailBlock>
        <DetailBlock label="characters" center>
          <span style={{ color: correct }}>{stats.correct}</span>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
          <span style={{ color: err }}>{stats.incorrect}</span>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>{stats.missed}</span>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>{stats.totalChars}</span>
        </DetailBlock>
        <DetailBlock label="consistency" center>
          <span className="text-text">{stats.consistency}%</span>
        </DetailBlock>
        <DetailBlock label="time" right>
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

function DetailBlock({ label, children, center, right }) {
  return (
    <div className={center ? 'text-center' : right ? 'text-right' : ''}>
      <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: sub }}>{label}</div>
      <div className="text-[1.1rem] font-semibold tabular-nums">{children}</div>
    </div>
  )
}
