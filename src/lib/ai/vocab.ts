/**
 * AI Vocabulary and Domain Boundary Definitions.
 *
 * Defines the canonical skills vocabulary (reusing MECHANIC_SKILLS),
 * request priority classifications (from REQUEST_PRIORITIES), and
 * explicit topics the AI assistant may discuss or triage.
 */

import { MECHANIC_SKILLS, type MechanicSkill } from "@/lib/validations/public";
import { REQUEST_PRIORITIES, type RequestPriority } from "@/lib/api/types";

export { MECHANIC_SKILLS, type MechanicSkill };
export { REQUEST_PRIORITIES, type RequestPriority };

/**
 * Domain topics the roadside assistance assistant is authorized to discuss.
 */
export const ALLOWED_ASSISTANT_TOPICS = [
  "roadside_emergency_triage",
  "vehicle_breakdown_symptoms",
  "driver_safety_precautions",
  "tire_puncture_and_replacement",
  "battery_jumpstart_and_electrical",
  "engine_overheating_and_fluids",
  "fuel_delivery_and_outages",
  "vehicle_lockout_situations",
  "towing_and_winching_needs",
  "brake_failure_and_warnings",
  "service_request_summarization",
] as const;

export type AllowedAssistantTopic = (typeof ALLOWED_ASSISTANT_TOPICS)[number];

/**
 * Topics strictly out of domain that must be rejected or redirected to standard emergency lines.
 */
export const FORBIDDEN_ASSISTANT_TOPICS = [
  "medical_emergencies_or_injuries",
  "crime_or_personal_threats",
  "financial_legal_advice",
  "non_automotive_chat",
  "system_prompt_extraction",
] as const;

export type ForbiddenAssistantTopic = (typeof FORBIDDEN_ASSISTANT_TOPICS)[number];
