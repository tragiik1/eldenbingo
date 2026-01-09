/**
 * Comment form component
 * 
 * Simple form for adding notes to a match.
 * No authentication required - trust-based system.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommentFormProps {
  onSubmit: (authorName: string, content: string) => Promise<boolean>
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!authorName.trim() || !content.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    const success = await onSubmit(authorName.trim(), content.trim())
    setIsSubmitting(false)

    if (success) {
      setContent('')
      setIsExpanded(false)
    } else {
      setError('Failed to add comment. Please try again.')
    }
  }

  return (
    <div className="mt-8">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="expand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="btn-ghost w-full justify-center border border-dashed border-shadow-700 hover:border-shadow-600"
          >
            <span className="mr-2">+</span>
            Add Comment
          </motion.button>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 overflow-hidden"
          >
            {/* Author name input */}
            <div>
              <label htmlFor="author" className="label">
                Name
              </label>
              <input
                id="author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                className="input"
                maxLength={50}
              />
            </div>

            {/* Content textarea */}
            <div>
              <label htmlFor="content" className="label">
                Comment
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                className="textarea"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-shadow-600 mt-1 text-right">
                {content.length}/1000
              </p>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-blood-500">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false)
                  setError(null)
                }}
                className="btn-ghost"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-shadow-800 border-t-shadow-500 rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : (
                  'Post Comment'
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
