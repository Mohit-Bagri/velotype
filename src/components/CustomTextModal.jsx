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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[600px] mx-4 rounded-2xl p-6"
            style={{
              background: 'var(--t-bg-surface)',
              border: '1px solid var(--t-nav-border)',
              boxShadow: '0 24px 64px -16px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--t-text)' }}>Custom Text</h2>
            <p className="text-[12px] mb-4" style={{ color: 'var(--t-sub)' }}>Paste or type your own text to practice</p>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your text here..."
              autoFocus
              className="w-full h-40 rounded-xl p-4 text-sm outline-none resize-none"
              style={{
                background: 'var(--t-glass)',
                border: '1px solid var(--t-glass-border)',
                color: 'var(--t-text)',
              }}
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px]" style={{ color: 'var(--t-sub)' }}>
                {text.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                  style={{ color: 'var(--t-sub)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={text.trim().length === 0}
                  className="px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-30"
                  style={{
                    background: 'var(--t-accent)',
                    color: '#fff',
                  }}
                >
                  Start
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
