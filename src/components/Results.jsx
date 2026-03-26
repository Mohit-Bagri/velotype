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

export default function Results({ stats, duration, mode, onRestart }) {
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
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 16px 48px -16px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4 p-8 pb-6">
        <StatCard label="wpm" value={stats.wpm} highlight />
        <StatCard label="accuracy" value={`${stats.accuracy}%`} highlight />
        <StatCard label="raw wpm" value={stats.rawWpm} />
        <StatCard label="consistency" value={`${stats.consistency}%`} />
      </div>

      <div className="mx-14 h-px" style={{ background: divider }} />

      {/* ── Chart ── */}
      <div className="px-8 pt-7 pb-4">
        <div className="flex items-center justify-between mb-5 px-6">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: sub }}>
            Performance
          </span>
          <div className="flex items-center gap-6 text-[11px]" style={{ color: sub }}>
            <span className="flex items-center gap-2">
              <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke={accent} strokeWidth="2" /></svg>
              wpm
            </span>
            <span className="flex items-center gap-2">
              <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke={raw} strokeWidth="1.5" strokeDasharray="3 3" /></svg>
              raw
            </span>
            <span className="flex items-center gap-2">
              <span style={{ color: err, fontWeight: 700, fontSize: 11 }}>x</span>
              errors
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 50, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.15} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={grid} vertical={false} />
            <XAxis dataKey="t" stroke="transparent" tick={{ fontSize: 11, fill: sub }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="w" stroke="transparent" tick={{ fontSize: 11, fill: sub }} tickLine={false} axisLine={false} width={40} domain={[0, yMax]} allowDecimals={false} />
            <YAxis yAxisId="e" orientation="right" stroke="transparent" tick={{ fontSize: 11, fill: sub }} tickLine={false} axisLine={false} width={35} allowDecimals={false} />
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

      <div className="mx-14 h-px" style={{ background: divider }} />

      {/* ── Details ── */}
      <div className="grid grid-cols-3 px-14 py-8">
        <div className="pl-2">
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: sub }}>test type</div>
          <div className="text-accent text-[15px] font-medium">
            {mode}{mode === 'time' ? ` ${duration}` : ''}{' '}
            <span className="text-neutral-500">english</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: sub }}>characters</div>
          <div className="text-[15px] font-semibold tabular-nums">
            <span style={{ color: correct }}>{stats.correct}</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}> / </span>
            <span style={{ color: err }}>{stats.incorrect}</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}> / </span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>{stats.missed}</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}> / </span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>{stats.totalChars}</span>
          </div>
        </div>
        <div className="text-right pr-2">
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: sub }}>time</div>
          <div className="text-text text-[15px] font-semibold tabular-nums">{stats.elapsedSeconds || duration}s</div>
        </div>
      </div>

      <div className="mx-14 h-px" style={{ background: divider }} />

      {/* ── Restart ── */}
      <div className="flex justify-center py-5">
        <button
          onClick={onRestart}
          className="text-neutral-500 hover:text-white transition-all duration-200 cursor-pointer p-3 rounded-full hover:bg-white/[0.04]"
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className="py-6 text-center rounded-xl" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: sub }}>{label}</div>
      <div className={`text-[2.75rem] font-bold leading-none tabular-nums ${highlight ? 'text-accent' : 'text-text'}`}>
        {value}
      </div>
    </div>
  )
}
