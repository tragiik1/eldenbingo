/**
 * Comment list component
 * 
 * Displays comments as etched notes, not chat spam.
 * Each comment feels like marginalia on an ancient document.
 */

import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'
import type { Comment } from '@/types'

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-shadow-500 font-body">
          No comments yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <CommentItem key={comment.id} comment={comment} index={index} />
      ))}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  index: number
}

function CommentItem({ comment, index }: CommentItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      {/* Decorative line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-shadow-700 via-shadow-800 to-transparent" />
      
      <div className="pl-6 py-2">
        {/* Author and date */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-ui text-sm font-medium text-parchment-300">
            {comment.author_name}
          </span>
          <span className="text-xs text-shadow-600 font-ui">
            {formatDate(comment.created_at)}
          </span>
        </div>
        
        {/* Content */}
        <p className="font-body text-parchment-400 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </motion.div>
  )
}
