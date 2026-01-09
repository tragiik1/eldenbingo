/**
 * Utility functions for Elden Bingo
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date for display
 * Shows relative time for recent dates, full date for older ones
 */
export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, 'MMMM d, yyyy');
}

/**
 * Format a date in a short style for cards
 */
export function formatDateShort(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
}

/**
 * Merge class names, filtering out falsy values
 * Simple alternative to clsx/classnames
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a gradient based on player colors
 * Creates a subtle radial gradient for backgrounds
 */
export function generatePlayerGradient(colors: string[]): string {
  if (colors.length === 0) return 'transparent';
  if (colors.length === 1) return `radial-gradient(circle at 50% 50%, ${colors[0]}15 0%, transparent 70%)`;
  
  const stops = colors.map((color, i) => {
    const position = (i / (colors.length - 1)) * 100;
    return `${color}10 ${position}%`;
  });
  
  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

/**
 * Get contrast color (black or white) for a given background
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#131316' : '#faf8f3';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a random ID (for client-side use)
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Outcome display helpers
 */
export const outcomeLabels: Record<string, string> = {
  bingo: 'Bingo',
  blackout: 'Blackout',
  abandoned: 'Abandoned',
  draw: 'Draw',
};

/**
 * Parse time string to minutes
 * Handles formats like "3h 42m", "1h", "45m", "2h 15m 30s"
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0
  
  let totalMinutes = 0
  
  // Extract hours
  const hoursMatch = timeStr.match(/(\d+)\s*h/i)
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60
  }
  
  // Extract minutes
  const minutesMatch = timeStr.match(/(\d+)\s*m/i)
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10)
  }
  
  // Extract seconds (optional, convert to minutes)
  const secondsMatch = timeStr.match(/(\d+)\s*s/i)
  if (secondsMatch) {
    totalMinutes += parseInt(secondsMatch[1], 10) / 60
  }
  
  return totalMinutes
}

/**
 * Format minutes to human-readable string
 * e.g., 222 -> "3h 42m", 60 -> "1h", 45 -> "45m"
 */
export function formatMinutesToTime(minutes: number): string {
  if (minutes < 1) return '< 1m'
  
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}m`
  }
}

/**
 * Format total hours and minutes nicely
 * e.g., 127.5 hours -> "127h 30m"
 */
export function formatTotalTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else if (minutes > 0) {
    return `${minutes}m`
  }
  return '0m'
}
