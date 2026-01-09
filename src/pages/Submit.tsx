/**
 * Submit Match page
 * 
 * Password-protected upload flow for new matches.
 * Password first, then image, then details.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, uploadBoardImage } from '@/lib/supabase'
import { cn, generateId } from '@/lib/utils'
import { PLAYER_COLORS, ACCOLADES, type MatchOutcome } from '@/types'
import { useAuthContext } from '@/contexts/AuthContext'

type Step = 'password' | 'upload' | 'details' | 'players' | 'review'

// Persistent authentication with expiration (30 days)
const AUTH_KEY = 'eldenbingo_authenticated'
const AUTH_EXPIRY_DAYS = 30

function isAuthenticated(): boolean {
  const authData = localStorage.getItem(AUTH_KEY)
  if (!authData) return false
  
  try {
    const { expires } = JSON.parse(authData)
    if (Date.now() > expires) {
      // Expired, remove it
      localStorage.removeItem(AUTH_KEY)
      return false
    }
    return true
  } catch {
    // Invalid data, remove it
    localStorage.removeItem(AUTH_KEY)
    return false
  }
}

function setAuthenticated(): void {
  const expires = Date.now() + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  localStorage.setItem(AUTH_KEY, JSON.stringify({ expires }))
}

interface PlayerInput {
  id: string
  name: string
  color: string
  is_winner: boolean
}

export function Submit() {
  const navigate = useNavigate()
  const { player, loading: authLoading } = useAuthContext()
  const [step, setStep] = useState<Step>('password')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Password state
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Check if already authenticated on mount
  // Logged-in users skip password entirely
  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (player) {
      // Logged in with Discord - skip password
      setStep('upload')
    } else if (isAuthenticated()) {
      // Has password auth from before
      setStep('upload')
    }
  }, [player, authLoading])

  // Password verification
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    
    const correctPassword = import.meta.env.VITE_SUBMIT_PASSWORD
    
    // If no password is configured, allow access
    if (!correctPassword) {
      setAuthenticated()
      setStep('upload')
      return
    }
    
    if (password === correctPassword) {
      setAuthenticated()
      setStep('upload')
    } else {
      setPasswordError('Incorrect password')
    }
  }

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split('T')[0])
  const [outcome, setOutcome] = useState<MatchOutcome>('bingo')
  const [timeTaken, setTimeTaken] = useState('')
  const [notes, setNotes] = useState('')
  const [accolades, setAccolades] = useState<string[]>([])
  const [players, setPlayers] = useState<PlayerInput[]>([
    { id: generateId(), name: '', color: PLAYER_COLORS[0].value, is_winner: false },
    { id: generateId(), name: '', color: PLAYER_COLORS[1].value, is_winner: false },
  ])

  // Image drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setStep('details')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // Player management
  const addPlayer = () => {
    const usedColors = players.map(p => p.color)
    const availableColor = PLAYER_COLORS.find(c => !usedColors.includes(c.value))?.value || PLAYER_COLORS[0].value
    setPlayers([...players, { 
      id: generateId(), 
      name: '', 
      color: availableColor, 
      is_winner: false 
    }])
  }

  const removePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id))
    }
  }

  const updatePlayer = (id: string, updates: Partial<PlayerInput>) => {
    setPlayers(players.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const setWinner = (id: string) => {
    setPlayers(players.map(p => ({ ...p, is_winner: p.id === id })))
  }

  // Accolade toggle
  const toggleAccolade = (accoladeId: string) => {
    setAccolades(prev => 
      prev.includes(accoladeId) 
        ? prev.filter(a => a !== accoladeId)
        : [...prev, accoladeId]
    )
  }

  // Form submission
  const handleSubmit = async () => {
    if (!imageFile) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        // Demo mode - save to localStorage
        const validPlayers = players.filter(p => p.name.trim())
        const demoMatch = {
          id: Date.now().toString(),
          title,
          played_at: playedAt,
          board_id: Date.now().toString(),
          outcome,
          metadata: {
            time_taken: timeTaken || undefined,
            notes: notes || undefined,
          },
          accolades,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          board: {
            id: Date.now().toString(),
            image_path: 'local',
            image_url: imagePreview,
            source: 'bingo-brawlers',
            created_at: new Date().toISOString(),
          },
          match_players: validPlayers.map((p, i) => ({
            id: `${Date.now()}-${i}`,
            match_id: Date.now().toString(),
            player_id: `player-${i}`,
            color: p.color,
            position: i,
            is_winner: p.is_winner,
            created_at: new Date().toISOString(),
            player: {
              id: `player-${i}`,
              name: p.name,
              color: p.color,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          })),
          comments: [],
        }
        
        // Save to localStorage
        const existingMatches = JSON.parse(localStorage.getItem('eldenbingo_matches') || '[]')
        existingMatches.unshift(demoMatch)
        localStorage.setItem('eldenbingo_matches', JSON.stringify(existingMatches))
        
        await new Promise(resolve => setTimeout(resolve, 500))
        navigate(`/match/${demoMatch.id}`)
        return
      }

      // Upload image
      const uploadResult = await uploadBoardImage(imageFile)
      if (!uploadResult) throw new Error('Failed to upload image')

      // Create board record
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert({
          image_path: uploadResult.path,
          image_url: uploadResult.url,
          source: 'bingo-brawlers',
        })
        .select()
        .single()

      if (boardError) throw boardError

      // Create/find players and create match
      const validPlayers = players.filter(p => p.name.trim())
      
      // Create match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          title,
          played_at: playedAt,
          board_id: board.id,
          outcome,
          metadata: {
            time_taken: timeTaken || undefined,
            notes: notes || undefined,
          },
          accolades,
        })
        .select()
        .single()

      if (matchError) throw matchError

      // Create players and match_players
      for (let i = 0; i < validPlayers.length; i++) {
        const p = validPlayers[i]
        
        // Create or find player
        const { data: player } = await supabase
          .from('players')
          .upsert(
            { name: p.name.trim(), color: p.color },
            { onConflict: 'name', ignoreDuplicates: false }
          )
          .select()
          .single()

        if (player) {
          // Create match_player relation
          await supabase
            .from('match_players')
            .insert({
              match_id: match.id,
              player_id: player.id,
              color: p.color,
              position: i,
              is_winner: p.is_winner,
            })
        }
      }

      // Navigate to the new match
      navigate(`/match/${match.id}`)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit match')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container-narrow">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-3xl md:text-4xl text-parchment-100 mb-4">
            Submit Match
          </h1>
          <p className="text-parchment-400 font-body">
            Upload a completed board and match details
          </p>
        </motion.div>

        {/* Progress indicator - only show after password */}
        {step !== 'password' && (
          <div className="flex items-center justify-center gap-2 mb-12">
            {(['upload', 'details', 'players', 'review'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-ui text-sm transition-colors',
                  step === s 
                    ? 'bg-gold-600 text-shadow-950' 
                    : ['upload', 'details', 'players', 'review'].indexOf(step) > i
                      ? 'bg-gold-600/30 text-gold-400'
                      : 'bg-shadow-800 text-shadow-500'
                )}>
                  {i + 1}
                </div>
                {i < 3 && (
                  <div className={cn(
                    'w-8 h-px mx-1',
                    ['upload', 'details', 'players', 'review'].indexOf(step) > i
                      ? 'bg-gold-600/50'
                      : 'bg-shadow-700'
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 'password' && (
            <PasswordStep
              password={password}
              setPassword={setPassword}
              error={passwordError}
              onSubmit={handlePasswordSubmit}
            />
          )}

          {step === 'upload' && (
            <UploadStep
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              imagePreview={imagePreview}
            />
          )}

          {step === 'details' && (
            <DetailsStep
              title={title}
              setTitle={setTitle}
              playedAt={playedAt}
              setPlayedAt={setPlayedAt}
              outcome={outcome}
              setOutcome={setOutcome}
              timeTaken={timeTaken}
              setTimeTaken={setTimeTaken}
              notes={notes}
              setNotes={setNotes}
              accolades={accolades}
              toggleAccolade={toggleAccolade}
              onBack={() => setStep('upload')}
              onNext={() => setStep('players')}
            />
          )}

          {step === 'players' && (
            <PlayersStep
              players={players}
              updatePlayer={updatePlayer}
              addPlayer={addPlayer}
              removePlayer={removePlayer}
              setWinner={setWinner}
              outcome={outcome}
              onBack={() => setStep('details')}
              onNext={() => setStep('review')}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              imagePreview={imagePreview}
              title={title}
              playedAt={playedAt}
              outcome={outcome}
              timeTaken={timeTaken}
              notes={notes}
              accolades={accolades}
              players={players}
              isSubmitting={isSubmitting}
              error={error}
              onBack={() => setStep('players')}
              onSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Step components

interface PasswordStepProps {
  password: string
  setPassword: (v: string) => void
  error: string | null
  onSubmit: (e: React.FormEvent) => void
}

function PasswordStep({ password, setPassword, error, onSubmit }: PasswordStepProps) {
  return (
    <motion.div
      key="password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-sm mx-auto"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-shadow-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-shadow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-parchment-400 font-body">
            Enter the password to submit matches
          </p>
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="input"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-blood-500 text-center">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full">
          Continue
        </button>
      </form>
    </motion.div>
  )
}

interface UploadStepProps {
  getRootProps: () => object
  getInputProps: () => object
  isDragActive: boolean
  imagePreview: string | null
}

function UploadStep({ getRootProps, getInputProps, isDragActive, imagePreview }: UploadStepProps) {
  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div
        {...getRootProps()}
        className={cn(
          'relative aspect-square max-w-lg mx-auto rounded-lg border-2 border-dashed',
          'flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
          isDragActive 
            ? 'border-gold-500 bg-gold-500/10' 
            : 'border-shadow-700 hover:border-shadow-600 bg-shadow-900/50'
        )}
      >
        <input {...getInputProps()} />
        
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Board preview" 
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-shadow-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-shadow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-heading text-lg text-parchment-300 mb-2">
              {isDragActive ? 'Drop image here' : 'Drop board image here'}
            </p>
            <p className="text-sm text-shadow-500 font-ui">
              or click to select
            </p>
            <p className="text-xs text-shadow-600 mt-4 font-ui">
              PNG, JPG, WebP up to 10MB
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface DetailsStepProps {
  title: string
  setTitle: (v: string) => void
  playedAt: string
  setPlayedAt: (v: string) => void
  outcome: MatchOutcome
  setOutcome: (v: MatchOutcome) => void
  timeTaken: string
  setTimeTaken: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  accolades: string[]
  toggleAccolade: (id: string) => void
  onBack: () => void
  onNext: () => void
}

function DetailsStep(props: DetailsStepProps) {
  const canContinue = props.title.trim().length > 0

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto space-y-6"
    >
      {/* Title */}
      <div>
        <label htmlFor="title" className="label">
          Match Title <span className="text-blood-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={props.title}
          onChange={(e) => props.setTitle(e.target.value)}
          placeholder="Match title"
          className="input"
          maxLength={100}
        />
      </div>

      {/* Date and Outcome */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="label">Date Played</label>
          <input
            id="date"
            type="date"
            value={props.playedAt}
            onChange={(e) => props.setPlayedAt(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="outcome" className="label">Outcome</label>
          <select
            id="outcome"
            value={props.outcome}
            onChange={(e) => props.setOutcome(e.target.value as MatchOutcome)}
            className="input"
          >
            <option value="bingo">Bingo</option>
            <option value="blackout">Blackout</option>
            <option value="draw">Draw</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="time" className="label">Duration (optional)</label>
        <input
          id="time"
          type="text"
          value={props.timeTaken}
          onChange={(e) => props.setTimeTaken(e.target.value)}
          placeholder="e.g. 3h 42m"
          className="input"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">Notes (optional)</label>
        <textarea
          id="notes"
          value={props.notes}
          onChange={(e) => props.setNotes(e.target.value)}
          placeholder="Any additional notes about the match"
          className="textarea"
          rows={3}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags (optional)</label>
        <div className="flex flex-wrap gap-2">
          {ACCOLADES.map((accolade) => (
            <button
              key={accolade.id}
              type="button"
              onClick={() => props.toggleAccolade(accolade.id)}
              className={cn(
                'px-3 py-1.5 rounded-md font-ui text-sm transition-all duration-200',
                'border',
                props.accolades.includes(accolade.id)
                  ? 'bg-gold-600/20 border-gold-600/40 text-gold-400'
                  : 'bg-shadow-800/50 border-shadow-700 text-parchment-400 hover:border-shadow-600'
              )}
            >
              {accolade.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button onClick={props.onBack} className="btn-ghost">
          Back
        </button>
        <button 
          onClick={props.onNext} 
          disabled={!canContinue}
          className="btn-primary flex-1"
        >
          Continue to Players
        </button>
      </div>
    </motion.div>
  )
}

// Player name autocomplete input
function PlayerNameInput({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string
  onChange: (name: string) => void
  placeholder: string 
}) {
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; color: string }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch player suggestions
  useEffect(() => {
    const searchPlayers = async () => {
      if (value.trim().length < 1) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('players')
          .select('id, name, color')
          .ilike('name', `%${value}%`)
          .limit(5)

        if (!error && data) {
          setSuggestions(data)
        }
      } catch (err) {
        console.error('Error searching players:', err)
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchPlayers, 200)
    return () => clearTimeout(debounce)
  }, [value])

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="input w-full"
        autoComplete="off"
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-shadow-900 border border-shadow-700 rounded-lg shadow-xl z-20 overflow-hidden">
          {suggestions.map((player) => (
            <button
              key={player.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(player.name)
                setShowSuggestions(false)
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-shadow-800 transition-colors"
            >
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: player.color }}
              />
              <span className="text-parchment-200 font-ui text-sm">{player.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-shadow-600 border-t-gold-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

interface PlayersStepProps {
  players: PlayerInput[]
  updatePlayer: (id: string, updates: Partial<PlayerInput>) => void
  addPlayer: () => void
  removePlayer: (id: string) => void
  setWinner: (id: string) => void
  outcome: MatchOutcome
  onBack: () => void
  onNext: () => void
}

function PlayersStep(props: PlayersStepProps) {
  const hasValidPlayers = props.players.some(p => p.name.trim().length > 0)
  const showWinner = props.outcome === 'bingo' || props.outcome === 'blackout'

  return (
    <motion.div
      key="players"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto space-y-6"
    >
      <p className="text-shadow-500 font-body text-sm">
        Add the players who participated in this match.
      </p>

      {/* Players list */}
      <div className="space-y-4">
        {props.players.map((player, index) => (
          <div key={player.id} className="card p-4 space-y-3">
            {/* Player header with name and remove */}
            <div className="flex items-center gap-3">
              <PlayerNameInput
                value={player.name}
                onChange={(name) => props.updatePlayer(player.id, { name })}
                placeholder={`Player ${index + 1} name`}
              />

              {/* Winner toggle */}
              {showWinner && (
                <button
                  type="button"
                  onClick={() => props.setWinner(player.id)}
                  className={cn(
                    'px-3 py-2 rounded-md transition-all text-sm font-ui',
                    player.is_winner
                      ? 'bg-gold-600/20 text-gold-400 border border-gold-600/40'
                      : 'bg-shadow-800 text-shadow-500 border border-shadow-700 hover:border-shadow-600'
                  )}
                >
                  {player.is_winner ? 'Winner' : 'Set Winner'}
                </button>
              )}

              {/* Remove button */}
              {props.players.length > 1 && (
                <button
                  type="button"
                  onClick={() => props.removePlayer(player.id)}
                  className="p-2 text-shadow-500 hover:text-red-400 transition-colors"
                  aria-label="Remove player"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Color picker - compact horizontal buttons */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-shadow-500 font-ui shrink-0">Color</span>
              <div className="flex gap-3">
                {PLAYER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => props.updatePlayer(player.id, { color: c.value })}
                    className={cn(
                      'w-5 h-5 rounded-full transition-all duration-200',
                      player.color === c.value 
                        ? 'ring-1 ring-offset-1 ring-offset-shadow-900 ring-parchment-400 scale-110' 
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                    aria-label={`Select ${c.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add player button */}
      {props.players.length < 4 && (
        <button
          type="button"
          onClick={props.addPlayer}
          className="w-full btn-ghost border border-dashed border-shadow-700 hover:border-shadow-600"
        >
          + Add Player
        </button>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button onClick={props.onBack} className="btn-ghost">
          Back
        </button>
        <button 
          onClick={props.onNext}
          disabled={!hasValidPlayers}
          className="btn-primary flex-1"
        >
          Review & Submit
        </button>
      </div>
    </motion.div>
  )
}

interface ReviewStepProps {
  imagePreview: string | null
  title: string
  playedAt: string
  outcome: MatchOutcome
  timeTaken: string
  notes: string
  accolades: string[]
  players: PlayerInput[]
  isSubmitting: boolean
  error: string | null
  onBack: () => void
  onSubmit: () => void
}

function ReviewStep(props: ReviewStepProps) {
  const validPlayers = props.players.filter(p => p.name.trim())
  const winner = validPlayers.find(p => p.is_winner)

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image preview */}
        <div className="image-frame">
          {props.imagePreview && (
            <img 
              src={props.imagePreview} 
              alt="Board preview" 
              className="w-full aspect-square object-cover"
            />
          )}
        </div>

        {/* Details summary */}
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-2xl text-parchment-100">
              {props.title}
            </h2>
            <p className="text-shadow-500 font-ui text-sm">
              {props.playedAt}
            </p>
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-sm font-ui bg-gold-600/20 text-gold-400 border border-gold-600/30">
            {props.outcome.charAt(0).toUpperCase() + props.outcome.slice(1)}
          </div>

          {/* Players */}
          <div>
            <p className="text-xs text-shadow-500 font-ui uppercase tracking-wider mb-2">
              Players
            </p>
            <div className="flex flex-wrap gap-2">
              {validPlayers.map((p) => (
                <span 
                  key={p.id}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-ui"
                  style={{ 
                    backgroundColor: `${p.color}20`,
                    color: p.color,
                    border: `1px solid ${p.color}40`
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                  {p.is_winner && <span className="ml-1">(W)</span>}
                </span>
              ))}
            </div>
          </div>

          {winner && (
            <p className="text-sm text-gold-400 font-ui">
              Winner: {winner.name}
            </p>
          )}

          {props.timeTaken && (
            <p className="text-sm text-parchment-400 font-ui">
              Duration: {props.timeTaken}
            </p>
          )}

          {props.notes && (
            <p className="text-sm text-parchment-400 font-body">
              {props.notes}
            </p>
          )}

          {props.accolades.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {props.accolades.map((id) => {
                const accolade = ACCOLADES.find(a => a.id === id)
                return accolade ? (
                  <span key={id} className="text-xs px-2 py-0.5 rounded bg-shadow-800 text-parchment-400 font-ui">
                    {accolade.label}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {props.error && (
        <div className="mt-6 p-4 bg-blood-700/20 border border-blood-600/30 rounded-lg">
          <p className="text-sm text-blood-500">{props.error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <button 
          onClick={props.onBack} 
          disabled={props.isSubmitting}
          className="btn-ghost"
        >
          Back
        </button>
        <button 
          onClick={props.onSubmit}
          disabled={props.isSubmitting}
          className="btn-primary flex-1"
        >
          {props.isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-shadow-800 border-t-shadow-500 rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            'Submit Match'
          )}
        </button>
      </div>
    </motion.div>
  )
}
