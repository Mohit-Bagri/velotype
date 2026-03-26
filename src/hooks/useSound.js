import { useCallback, useRef, useEffect } from 'react'

function ensureCtx(ref) {
  if (!ref.current || ref.current.state === 'closed') {
    ref.current = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (ref.current.state === 'suspended') {
    ref.current.resume().catch(() => {})
  }
  return ref.current
}

function makeClick(ctx, freq, vol, decay) {
  try {
    const len = Math.floor(ctx.sampleRate * 0.012)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = freq
    bp.Q.value = 1.2
    const g = ctx.createGain()
    g.gain.value = vol
    src.connect(bp)
    bp.connect(g)
    g.connect(ctx.destination)
    src.start()
  } catch (_) {}
}

function makeTone(ctx, freq, dur, vol, type) {
  try {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    g.gain.setValueAtTime(vol, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + dur + 0.01)
  } catch (_) {}
}

export function useSound(enabled) {
  const ctxRef = useRef(null)

  useEffect(() => {
    // Initialize on first user interaction
    const init = () => {
      ensureCtx(ctxRef)
      document.removeEventListener('keydown', init)
      document.removeEventListener('mousedown', init)
    }
    document.addEventListener('keydown', init)
    document.addEventListener('mousedown', init)
    return () => {
      document.removeEventListener('keydown', init)
      document.removeEventListener('mousedown', init)
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => {})
      }
    }
  }, [])

  const playType = useCallback(() => {
    if (!enabled) return
    makeClick(ensureCtx(ctxRef), 1000 + Math.random() * 600, 0.18, 5)
  }, [enabled])

  const playError = useCallback(() => {
    if (!enabled) return
    makeTone(ensureCtx(ctxRef), 250, 0.07, 0.15, 'triangle')
  }, [enabled])

  const playSpace = useCallback(() => {
    if (!enabled) return
    const ctx = ensureCtx(ctxRef)
    try {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(120, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05)
      g.gain.setValueAtTime(0.2, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch (_) {}
  }, [enabled])

  const playBack = useCallback(() => {
    if (!enabled) return
    makeClick(ensureCtx(ctxRef), 500, 0.1, 3)
  }, [enabled])

  return { playType, playError, playSpace, playBack }
}
