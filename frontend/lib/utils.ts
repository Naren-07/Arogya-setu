/**
 * Format a timestamp for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get language display name
 */
export function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: 'English',
    hi: 'हिन्दी (Hindi)',
    mr: 'मराठी (Marathi)',
  };
  return languages[code] || code;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
