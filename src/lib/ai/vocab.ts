import { MECHANIC_SKILLS } from "@/lib/validations/public";
import { REQUEST_PRIORITIES } from "@/lib/api/types";

/**
 * Skill vocabulary for AI features.
 * Re-exported from the canonical source so AI modules import from one place.
 */
export const SKILLS = MECHANIC_SKILLS;

/**
 * Request priority values the AI may reference.
 */
export const PRIORITIES = REQUEST_PRIORITIES;

/**
 * Topics the AI assistant is allowed to discuss.
 * Anything outside this list should be politely declined.
 */
export const ALLOWED_TOPICS = [
  "roadside assistance",
  "vehicle breakdown",
  "towing",
  "tire change",
  "battery jumpstart",
  "engine diagnostics",
  "brake service",
  "fuel delivery",
  "lockout assistance",
  "mechanic availability",
  "service request status",
  "payment and invoicing",
  "estimated arrival time",
  "safety tips",
  "vehicle maintenance tips",
] as const;

export type AllowedTopic = (typeof ALLOWED_TOPICS)[number];
