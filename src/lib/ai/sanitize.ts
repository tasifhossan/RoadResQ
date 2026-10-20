import "server-only";

/**
 * Input sanitization for text sent to the Gemini API.
 *
 * Goals:
 *  - Strip control characters and collapse whitespace.
 *  - Redact emails, phone-like sequences, URLs, and long digit strings
 *    so personal data is never sent to external AI services.
 *  - Cap input length to prevent abuse.
 */

const MAX_INPUT_LENGTH = 500;

/** Patterns that match personal-data-like content. */
const REDACTION_PATTERNS: ReadonlyArray<RegExp> = [
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // URLs (http/https/ftp)
  /https?:\/\/[^\s]+/gi,
  /ftp:\/\/[^\s]+/gi,
  // Phone-like sequences: 7 or more consecutive digits (with optional separators)
  /(?:\+?\d[\d\s\-().]{5,}\d)/g,
  // Long digit strings (7+ digits in a row)
  /\d{7,}/g,
];

export interface SanitizeResult {
  /** The sanitized text, safe to send to Gemini. */
  text: string;
  /** Whether any content was redacted. */
  redacted: boolean;
}

/**
 * Sanitize user input before sending to Gemini.
 *
 * 1. Trim leading/trailing whitespace.
 * 2. Strip control characters (keep newlines/tabs for readability).
 * 3. Collapse runs of whitespace to a single space.
 * 4. Redact emails, phone numbers, URLs, and long digit strings.
 * 5. Cap at MAX_INPUT_LENGTH characters.
 */
export function sanitizeInput(raw: string): SanitizeResult {
  let text = raw.trim();

  // Strip control characters except \n and \t
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Collapse whitespace (spaces, tabs, newlines → single space)
  text = text.replace(/\s+/g, " ").trim();

  // Redact PII patterns
  let redacted = false;
  for (const pattern of REDACTION_PATTERNS) {
    // Reset lastIndex for global regexes reused across calls
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      redacted = true;
      pattern.lastIndex = 0;
      text = text.replace(pattern, "[redacted]");
    }
  }

  // Cap length
  if (text.length > MAX_INPUT_LENGTH) {
    text = text.slice(0, MAX_INPUT_LENGTH);
    // Don't cut in the middle of a word — backtrack to last space
    const lastSpace = text.lastIndexOf(" ");
    if (lastSpace > MAX_INPUT_LENGTH * 0.8) {
      text = text.slice(0, lastSpace);
    }
  }

  return { text, redacted };
}
