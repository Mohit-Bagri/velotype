export default function Timer({ timeLeft, status, mode, liveWpm, elapsedTime }) {
  if (status !== 'running') {
    return <div style={{ height: 40 }} />
  }

  return (
    <div style={{ height: 40 }} className="flex items-center gap-4 mb-1">
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

      {/* Live WPM */}
      {liveWpm > 0 && (
        <span className="text-sm tabular-nums leading-none" style={{ color: 'var(--t-sub)' }}>
          {liveWpm} wpm
        </span>
      )}
    </div>
  )
}
