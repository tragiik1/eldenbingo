/**
 * Supabase Client Configuration
 * 
 * Environment variables are loaded from .env file.
 * Create .env.local with:
 *   VITE_SUPABASE_URL=your-project-url
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Running in demo mode.\n' +
    'Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Sign in with Discord OAuth
 */
export async function signInWithDiscord() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('Discord login error:', error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Upload a board image to Supabase Storage
 * Returns the public URL for the uploaded image
 */
export async function uploadBoardImage(file: File): Promise<{
  path: string;
  url: string;
} | null> {
  // Generate a unique filename
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'png';
  const filename = `${timestamp}-${Math.random().toString(36).slice(2)}.${extension}`;
  const path = `boards/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from('boards')
    .upload(path, file, {
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('boards')
    .getPublicUrl(path);

  return { path, url: publicUrl };
}

/**
 * Get public URL for a stored image
 */
export function getBoardImageUrl(path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from('boards')
    .getPublicUrl(path);
  return publicUrl;
}
