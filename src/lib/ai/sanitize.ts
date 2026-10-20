/**
 * Input sanitization utility for LLM requests.
 *
 * Strips control characters, collapses whitespace, caps input length,
 * and redacts emails, phone numbers, URLs, and long digit sequences
 * before sending to external AI models.
 */

export interface SanitizeResult {
  text: string;
  redacted: boolean;
}

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;
const URL_REGEX = /(?:https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Match phone-like sequences (7 or more digits separated optionally by +, -, ., (), or whitespace)
const PHONE_AND_DIGITS_REGEX = /(?:\+?\d[\s().-]*){6,}\d/g;
// Long isolated digit strings of 7 or more digits
const LONG_DIGITS_REGEX = /\b\d{7,}\b/g;

export function sanitizeInput(input: string | null | undefined): SanitizeResult {
  if (!input) {
    return { text: "", redacted: false };
  }

  // 1. Strip control characters
  let text = String(input).replace(CONTROL_CHARS_REGEX, "");

  // 2. Collapse whitespace & trim
  text = text.replace(/\s+/g, " ").trim();

  let redacted = false;

  // 3. Redact URLs
  if (URL_REGEX.test(text)) {
    redacted = true;
    text = text.replace(URL_REGEX, "[redacted]");
  }

  // 4. Redact Emails
  if (EMAIL_REGEX.test(text)) {
    redacted = true;
    text = text.replace(EMAIL_REGEX, "[redacted]");
  }

  // 5. Redact Phone-like sequences (7 or more digits)
  if (PHONE_AND_DIGITS_REGEX.test(text)) {
    redacted = true;
    text = text.replace(PHONE_AND_DIGITS_REGEX, "[redacted]");
  }

  // 6. Redact Long digit strings (7+ continuous digits)
  if (LONG_DIGITS_REGEX.test(text)) {
    redacted = true;
    text = text.replace(LONG_DIGITS_REGEX, "[redacted]");
  }

  // Normalize spaces if redactions left multiple spaces
  text = text.replace(/\s+/g, " ").trim();

  // 7. Cap at 500 characters
  if (text.length > 500) {
    text = text.slice(0, 500).trim();
  }

  return { text, redacted };
}
