import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CustomTextModal({ open, onClose, onSubmit }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Focus textarea when modal opens, with a delay to ensure it's mounted
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [open, onClose])

  const handleSubmit = () => {
    const words = text.trim().split(/\s+/).filter(Boolean)
    if (words.length > 0) {
      onSubmit(words)
      setText('')
      onClose()
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-[90vw] max-w-[600px] rounded-2xl"
            style={{
              background: 'var(--t-bg)',
              border: '1px solid var(--t-nav-border)',
              boxShadow: '0 24px 64px -16px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 sm:p-8">
              <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--t-text)' }}>Custom Text</h2>
              <p className="text-[11px] mb-5" style={{ color: 'var(--t-sub)' }}>Paste or type your own text to practice</p>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
                placeholder="Paste your text here..."
                className="w-full h-40 rounded-xl p-4 text-[13px] outline-none resize-none font-mono"
                style={{
                  background: 'var(--t-glass)',
                  border: '1px solid var(--t-glass-border)',
                  color: 'var(--t-text)',
                  position: 'relative',
                  zIndex: 1,
                }}
              />

              <div className="flex items-center justify-between mt-5">
                <span className="text-[11px] tabular-nums" style={{ color: 'var(--t-sub)' }}>
                  {wordCount} word{wordCount !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onClose() }}
                    className="px-5 py-2.5 rounded-lg text-[13px] cursor-pointer transition-colors"
                    style={{ color: 'var(--t-sub)', background: 'none', border: 'none' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSubmit() }}
                    disabled={wordCount === 0}
                    className="px-6 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: 'var(--t-accent)', color: '#fff', border: 'none' }}
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
