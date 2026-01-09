/**
 * Core type definitions for Elden Bingo
 * 
 * These types mirror our Supabase schema but are used throughout
 * the frontend for type safety and documentation.
 */

// ============================================
// DATABASE TYPES
// ============================================

export type MatchOutcome = 'bingo' | 'blackout' | 'abandoned' | 'draw';

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  image_path: string;
  image_url: string;
  source: string;
  perceptual_hash?: string;
  width?: number;
  height?: number;
  created_at: string;
}

export interface MatchMetadata {
  time_taken?: string;        // e.g., "2h 34m"
  notes?: string;
  winner_id?: string;
  [key: string]: unknown;     // Allow additional metadata
}

export interface Match {
  id: string;
  title: string;
  played_at: string;          // ISO date string
  board_id: string;
  outcome: MatchOutcome;
  metadata: MatchMetadata;
  accolades: string[];
  created_at: string;
  updated_at: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string;
  color: string;
  position: number;
  is_winner?: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  match_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// JOINED/ENRICHED TYPES
// Used when fetching data with relations
// ============================================

export interface MatchPlayerWithDetails extends MatchPlayer {
  player: Player;
}

export interface MatchWithDetails extends Match {
  board: Board;
  match_players: MatchPlayerWithDetails[];
}

export interface MatchWithComments extends MatchWithDetails {
  comments: Comment[];
}

// ============================================
// FORM/INPUT TYPES
// Used for creating new records
// ============================================

export interface CreateMatchInput {
  title: string;
  played_at: string;
  outcome: MatchOutcome;
  metadata?: MatchMetadata;
  accolades?: string[];
  players: Array<{
    name: string;
    color: string;
    is_winner?: boolean;
  }>;
}

export interface CreateCommentInput {
  match_id: string;
  author_name: string;
  content: string;
}

// ============================================
// UI STATE TYPES
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Player colors - matches bingo board colors
export const PLAYER_COLORS = [
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Red', value: '#e74c3c' },
  { name: 'Blue', value: '#5dade2' },
] as const;

// Optional match tags
export const ACCOLADES = [
  { id: 'short', label: 'Short' },
  { id: 'long', label: 'Long' },
  { id: 'close', label: 'Close' },
  { id: 'comeback', label: 'Comeback' },
  { id: 'first-win', label: 'First Win' },
  { id: 'rematch', label: 'Rematch' },
  { id: 'practice', label: 'Practice' },
  { id: 'tournament', label: 'Tournament' },
] as const;
