-- Elden Bingo Database Schema
-- A clean, extensible data model for preserving match memories
-- 
-- Philosophy: Simple where possible, flexible where needed.
-- No auth complexity - just lightweight player identities.

-- ============================================
-- PLAYERS
-- Lightweight identity - no forced authentication
-- Players are created implicitly when added to matches
-- ============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  -- Color for visual identification across matches
  -- Stored as hex string (e.g., "#d4a84a")
  color TEXT NOT NULL DEFAULT '#d4a84a',
  -- Optional avatar URL
  avatar_url TEXT,
  -- Soft tracking for deduplication
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for name lookups (case-insensitive matching)
CREATE INDEX idx_players_name_lower ON players (LOWER(name));

-- ============================================
-- BOARDS
-- The canonical bingo board images
-- Source is always "bingo-brawlers" for now
-- ============================================
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Storage path in Supabase Storage
  image_path TEXT NOT NULL,
  -- Public URL for direct access
  image_url TEXT NOT NULL,
  -- Source application (always "bingo-brawlers" currently)
  source TEXT NOT NULL DEFAULT 'bingo-brawlers',
  -- Optional perceptual hash for deduplication
  -- Using pHash or similar - 64-bit hash as hex string
  perceptual_hash TEXT,
  -- Dimensions for display optimization
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for deduplication lookups
CREATE INDEX idx_boards_phash ON boards (perceptual_hash) WHERE perceptual_hash IS NOT NULL;

-- ============================================
-- MATCHES
-- The core entity - a completed bingo session
-- Board images are the sacred artifacts
-- ============================================
CREATE TYPE match_outcome AS ENUM ('bingo', 'blackout', 'abandoned', 'draw');

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Human-readable title (e.g., "The Great Malenia Incident")
  title TEXT NOT NULL,
  -- When the match was played (user-provided, not upload time)
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Reference to the board image
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE RESTRICT,
  -- How the match ended
  outcome match_outcome NOT NULL DEFAULT 'bingo',
  -- Optional metadata - loosely structured for flexibility
  -- Includes: time_taken, estimated_deaths, notes, winner_id, etc.
  metadata JSONB NOT NULL DEFAULT '{}',
  -- Vibe-based accolades (optional, just for flavor)
  -- e.g., ["cursed", "legendary", "speed-demon"]
  accolades TEXT[] NOT NULL DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for chronological listing
CREATE INDEX idx_matches_played_at ON matches (played_at DESC);
CREATE INDEX idx_matches_created_at ON matches (created_at DESC);

-- ============================================
-- MATCH_PLAYERS
-- Junction table linking players to matches
-- Each player has a color for that specific match
-- ============================================
CREATE TABLE match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  -- Color used in this specific match (overrides player default)
  color TEXT NOT NULL,
  -- Position/order for consistent display
  position INTEGER NOT NULL DEFAULT 0,
  -- Was this player the winner? (null if draw/abandoned)
  is_winner BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each player can only appear once per match
  UNIQUE(match_id, player_id)
);

CREATE INDEX idx_match_players_match ON match_players (match_id);
CREATE INDEX idx_match_players_player ON match_players (player_id);

-- ============================================
-- COMMENTS
-- Etched notes on matches - feel like marginalia, not chat
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  -- Author name (no auth required - honor system)
  author_name TEXT NOT NULL,
  -- The comment content (markdown supported)
  content TEXT NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_match ON comments (match_id);
CREATE INDEX idx_comments_created ON comments (created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- Automatically update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- Open read access, simple write access
-- No complex auth - this is a friend group archive
-- ============================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read everything
CREATE POLICY "Public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON boards FOR SELECT USING (true);
CREATE POLICY "Public read access" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read access" ON match_players FOR SELECT USING (true);
CREATE POLICY "Public read access" ON comments FOR SELECT USING (true);

-- Everyone can insert (no auth required for this friend-group app)
CREATE POLICY "Public insert access" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON boards FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON match_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON comments FOR INSERT WITH CHECK (true);

-- Everyone can update (trust-based system)
CREATE POLICY "Public update access" ON players FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON matches FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON match_players FOR UPDATE USING (true);
CREATE POLICY "Public update access" ON comments FOR UPDATE USING (true);

-- ============================================
-- STORAGE BUCKET
-- Run this in Supabase dashboard or via API
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('boards', 'boards', true);

-- Storage policies for board images
-- CREATE POLICY "Public read access" ON storage.objects 
--   FOR SELECT USING (bucket_id = 'boards');
-- CREATE POLICY "Public upload access" ON storage.objects 
--   FOR INSERT WITH CHECK (bucket_id = 'boards');
