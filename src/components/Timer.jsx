export default function Timer({ timeLeft, status, mode }) {
  if (mode !== 'time' || status !== 'running') {
    return <div style={{ height: 40 }} />
  }

  return (
    <div style={{ height: 40 }} className="flex items-center mb-1">
      <span
        className="text-2xl font-semibold tabular-nums leading-none text-accent"
      >
        {timeLeft}
      </span>
    </div>
  )
}
