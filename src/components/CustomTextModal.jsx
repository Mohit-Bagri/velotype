import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CustomTextModal({ open, onClose, onSubmit }) {
  const [text, setText] = useState('')

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
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-[640px] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--t-bg)',
              border: '1px solid var(--t-nav-border)',
              boxShadow: '0 24px 64px -16px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--t-text)' }}>Custom Text</h2>
              <p className="text-[11px] mt-1" style={{ color: 'var(--t-sub)' }}>Paste or type your own text to practice</p>
            </div>

            {/* Textarea */}
            <div className="px-6">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your text here..."
                autoFocus
                className="w-full h-36 rounded-xl p-4 text-[13px] outline-none resize-none font-mono"
                style={{
                  background: 'var(--t-glass)',
                  border: '1px solid var(--t-glass-border)',
                  color: 'var(--t-text)',
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-[11px] tabular-nums" style={{ color: 'var(--t-sub)' }}>
                {wordCount} word{wordCount !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-[13px] cursor-pointer transition-colors"
                  style={{ color: 'var(--t-sub)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={wordCount === 0}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--t-accent)',
                    color: '#fff',
                  }}
                >
                  Start typing
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
