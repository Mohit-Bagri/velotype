export default function Timer({ timeLeft, status, mode, liveWpm, elapsedTime, speedUnit = 'wpm' }) {
  if (status !== 'running') {
    return <div style={{ height: 40 }} />
  }

  const isCpm = speedUnit === 'cpm'
  const displaySpeed = isCpm ? liveWpm * 5 : liveWpm
  const unit = isCpm ? 'cpm' : 'wpm'

  return (
    <div style={{ height: 40 }} className="flex items-center gap-4 mb-1" role="status" aria-live="polite" aria-label="Timer">
      {/* Time display */}
      {mode === 'time' && (
        <span className="text-2xl font-semibold tabular-nums leading-none text-accent">
          {timeLeft}
        </span>
      )}
      {mode === 'zen' && (
        <span className="text-2xl font-semibold tabular-nums leading-none text-accent">
          {elapsedTime}s
        </span>
      )}

      {/* Live speed */}
      {displaySpeed > 0 && (
        <span className="text-sm tabular-nums leading-none" style={{ color: 'var(--t-sub)' }}>
          {displaySpeed} {unit}
        </span>
      )}
    </div>
  )
}
