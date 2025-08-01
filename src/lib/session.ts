/**
 * Generate a unique session ID for the current browser session
 */
export function generateSessionId(): string {
  // Try to get existing session ID from localStorage
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('chart_session_id');
    if (existing) {
      return existing;
    }
  }

  // Generate new session ID
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store in localStorage for persistence across page reloads
  if (typeof window !== 'undefined') {
    localStorage.setItem('chart_session_id', sessionId);
  }

  return sessionId;
}

/**
 * Get the current session ID
 */
export function getSessionId(): string {
  return generateSessionId();
}

/**
 * Clear the session ID (useful for testing or resetting)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chart_session_id');
  }
} 