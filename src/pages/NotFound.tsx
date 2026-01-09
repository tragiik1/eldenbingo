/**
 * 404 Not Found page
 * 
 * Atmospheric error page that fits the theme.
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="text-8xl font-heading text-shadow-800 mb-8">404</div>

        <h1 className="font-heading text-2xl md:text-3xl text-parchment-200 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-parchment-400 font-body max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            Back to Archive
          </Link>
          <Link to="/gallery" className="btn-ghost">
            Browse Gallery
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
