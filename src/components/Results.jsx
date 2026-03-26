import { motion } from 'framer-motion'
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const C = {
  accent: '#8b5cf6',
  sub: 'rgba(255,255,255,0.3)',
  text: '#d1d0e0',
  error: '#f87171',
  correct: '#a3e635',
  grid: 'rgba(255,255,255,0.04)',
  label: 'rgba(255,255,255,0.18)',
  raw: 'rgba(255,255,255,0.35)',
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload || {}
  return (
    <div style={{
      background: 'rgba(5,5,10,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      minWidth: 130,
    }}>
      <div style={{ color: '#fff', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Row color={C.error} label="errors" value={d.err || 0} />
        <Row color={C.accent} label="wpm" value={d.wpm || 0} />
        <Row color={C.raw} label="raw" value={d.raw || 0} />
      </div>
    </div>
  )
}

function Row({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ color: 'rgba(255,255,255,0.5)', flex: 1 }}>{label}:</span>
      <span style={{ color: '#fff', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function ChartLegend() {
  return (
    <div className="flex items-center justify-center gap-6 text-[11px] pt-3" style={{ color: C.label }}>
      <span className="flex items-center gap-2">
        <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke={C.accent} strokeWidth="2" /></svg>
        wpm
      </span>
      <span className="flex items-center gap-2">
        <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke={C.raw} strokeWidth="1.5" strokeDasharray="3 3" /></svg>
        raw
      </span>
      <span className="flex items-center gap-2">
        <span style={{ color: C.error, fontWeight: 700, fontSize: 11 }}>x</span>
        errors
      </span>
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
      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 p-8">
        <Stat label="wpm" value={stats.wpm} accent />
        <Stat label="accuracy" value={`${stats.accuracy}%`} accent />
        <Stat label="raw wpm" value={stats.rawWpm} />
        <Stat label="consistency" value={`${stats.consistency}%`} />
      </div>

      <div className="mx-12 h-px bg-white/[0.05]" />

      {/* Chart */}
      <div className="px-12 pt-8 pb-6">
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: C.label }}>
          Performance
        </span>

        <div className="mt-4" style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.accent} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis
                dataKey="t"
                stroke="transparent"
                tick={{ fontSize: 11, fill: C.label }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="w"
                stroke="transparent"
                tick={{ fontSize: 11, fill: C.label }}
                tickLine={false}
                axisLine={false}
                width={36}
                domain={[0, yMax]}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="e"
                orientation="right"
                stroke="transparent"
                tick={{ fontSize: 11, fill: C.label }}
                tickLine={false}
                axisLine={false}
                width={28}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
              <Area
                yAxisId="w" type="monotone" dataKey="wpm" name="WPM"
                stroke={C.accent} strokeWidth={2} fill="url(#wg)"
                dot={false} activeDot={{ r: 4, fill: C.accent, stroke: '#0f0f14', strokeWidth: 2 }}
              />
              <Line
                yAxisId="w" type="monotone" dataKey="raw" name="Raw"
                stroke={C.raw} strokeWidth={1.5} strokeDasharray="4 4" dot={false}
              />
              <Line
                yAxisId="e" type="stepAfter" dataKey="err" name="Errors"
                stroke="transparent"
                dot={p => {
                  if (!p.payload || p.payload.err <= 0) return null
                  return <svg key={p.index} x={p.cx - 5} y={p.cy - 6} width={10} height={12}><text x={5} y={10} textAnchor="middle" fill={C.error} fontSize={11} fontWeight="bold">x</text></svg>
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <ChartLegend />
      </div>

      <div className="mx-12 h-px bg-white/[0.05]" />

      {/* Details */}
      <div className="grid grid-cols-3 px-12 py-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: C.label }}>test type</div>
          <div className="text-accent text-[15px] font-medium">
            {mode}{mode === 'time' ? ` ${duration}` : ''}{' '}
            <span className="text-neutral-500">english</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: C.label }}>characters</div>
          <div className="text-[15px] font-semibold tabular-nums">
            <span style={{ color: C.correct }}>{stats.correct}</span>
            <span className="text-white/10"> / </span>
            <span style={{ color: C.error }}>{stats.incorrect}</span>
            <span className="text-white/10"> / </span>
            <span className="text-white/25">{stats.missed}</span>
            <span className="text-white/10"> / </span>
            <span className="text-white/25">{stats.totalChars}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: C.label }}>time</div>
          <div className="text-text text-[15px] font-semibold tabular-nums">{stats.elapsedSeconds || duration}s</div>
        </div>
      </div>

      <div className="mx-12 h-px bg-white/[0.05]" />

      {/* Restart */}
      <div className="flex justify-center py-6">
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

function Stat({ label, value, accent }) {
  return (
    <div className="p-8 text-center rounded-xl" style={{ background: 'rgba(255,255,255,0.015)' }}>
      <div className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: C.label }}>{label}</div>
      <div className={`text-[2.75rem] font-bold leading-none tabular-nums ${accent ? 'text-accent' : 'text-text'}`}>
        {value}
      </div>
    </div>
  )
}
