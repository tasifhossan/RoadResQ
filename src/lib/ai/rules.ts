import { SKILLS } from "./vocab";
import type { MechanicSkill } from "@/lib/validations/public";

export type AssistantUrgency = "LOW" | "NORMAL" | "HIGH" | "EMERGENCY";

export interface AssistantResponseData {
  reply: string;
  urgency: AssistantUrgency | null;
  safetySteps: string[];
  suggestedSkills: MechanicSkill[];
  requestDescription: string | null;
  followUps: string[];
}

export interface AssistantRulesResult {
  data: AssistantResponseData;
  source: "rules";
  redacted: boolean;
}

/**
 * Keyword rules:
 * battery, jump, click, dead -> Battery
 * tire, tyre, flat, puncture -> Tire
 * overheat, steam, smoke, engine noise -> Engine, with smoke or fire -> EMERGENCY
 * tow, stuck, accident, ditch -> Towing
 * key, locked -> Lockout
 * fuel, petrol, diesel, empty -> Fuel Delivery
 * brake -> Brakes
 * AC -> AC
 * electrical -> Electrical
 * gearbox, transmission -> Transmission
 *
 * plus a short generic safety checklist.
 */
export function getRuleBasedAssistantResponse(
  userText: string,
  wasRedacted = false
): AssistantRulesResult {
  const lower = userText.toLowerCase();

  const skills: MechanicSkill[] = [];
  const addSkill = (s: MechanicSkill) => {
    if (!skills.includes(s) && SKILLS.includes(s)) {
      skills.push(s);
    }
  };

  let urgency: AssistantUrgency = "NORMAL";
  let hasEmergencyKeywords = false;
  let hasHighKeywords = false;

  // Emergency triggers
  if (
    lower.includes("smoke") ||
    lower.includes("fire") ||
    lower.includes("flame") ||
    lower.includes("accident") ||
    lower.includes("injury") ||
    lower.includes("highway") ||
    lower.includes("live traffic") ||
    lower.includes("danger") ||
    lower.includes("bleed") ||
    lower.includes("crash")
  ) {
    hasEmergencyKeywords = true;
    urgency = "EMERGENCY";
  } else if (
    lower.includes("stuck") ||
    lower.includes("stranded") ||
    lower.includes("cannot drive") ||
    lower.includes("won't move") ||
    lower.includes("night") ||
    lower.includes("dark")
  ) {
    hasHighKeywords = true;
    urgency = "HIGH";
  }

  // Keywords mapping
  if (
    lower.includes("battery") ||
    lower.includes("jump") ||
    lower.includes("click") ||
    lower.includes("dead")
  ) {
    addSkill("Battery");
    if (!hasEmergencyKeywords && !hasHighKeywords) urgency = "NORMAL";
  }

  if (
    lower.includes("tire") ||
    lower.includes("tyre") ||
    lower.includes("flat") ||
    lower.includes("puncture")
  ) {
    addSkill("Tire");
    if (!hasEmergencyKeywords && !hasHighKeywords) urgency = "NORMAL";
  }

  if (
    lower.includes("overheat") ||
    lower.includes("steam") ||
    lower.includes("engine noise") ||
    lower.includes("engine") ||
    lower.includes("smoke")
  ) {
    addSkill("Engine");
    if (lower.includes("smoke") || lower.includes("fire")) {
      urgency = "EMERGENCY";
    }
  }

  if (
    lower.includes("tow") ||
    lower.includes("stuck") ||
    lower.includes("accident") ||
    lower.includes("ditch")
  ) {
    addSkill("Towing");
    if (lower.includes("accident")) {
      urgency = "EMERGENCY";
    } else if (!hasEmergencyKeywords) {
      urgency = "HIGH";
    }
  }

  if (lower.includes("key") || lower.includes("locked") || lower.includes("lockout")) {
    addSkill("Lockout");
    if (!hasEmergencyKeywords && !hasHighKeywords) urgency = "NORMAL";
  }

  if (
    lower.includes("fuel") ||
    lower.includes("petrol") ||
    lower.includes("diesel") ||
    lower.includes("gas") ||
    lower.includes("empty")
  ) {
    addSkill("Fuel Delivery");
    if (!hasEmergencyKeywords && !hasHighKeywords) urgency = "NORMAL";
  }

  if (lower.includes("brake")) {
    addSkill("Brakes");
    if (!hasEmergencyKeywords) urgency = "HIGH";
  }

  if (lower.includes("ac") || lower.includes("air condition") || lower.includes("cooling")) {
    addSkill("AC");
    if (!hasEmergencyKeywords && !hasHighKeywords) urgency = "LOW";
  }

  if (
    lower.includes("electrical") ||
    lower.includes("fuse") ||
    lower.includes("light") ||
    lower.includes("wiring")
  ) {
    addSkill("Electrical");
  }

  if (
    lower.includes("gearbox") ||
    lower.includes("transmission") ||
    lower.includes("clutch") ||
    lower.includes("gear")
  ) {
    addSkill("Transmission");
  }

  // Cap skills to max 3
  const suggestedSkills = skills.slice(0, 3);

  // Safety steps (max 4, each max 140 chars)
  const safetySteps: string[] = [];
  if (urgency === "EMERGENCY") {
    safetySteps.push("Turn on hazard lights immediately and move all passengers away from traffic to a safe spot.");
    safetySteps.push("If there is fire, smoke, injury, or immediate road danger, call 999 (National Emergency) immediately.");
    safetySteps.push("Turn off the vehicle engine once parked safely and keep a safe distance from oncoming vehicles.");
    safetySteps.push("Place an emergency reflective warning triangle 50 meters behind the vehicle if safe to do so.");
  } else if (urgency === "HIGH") {
    safetySteps.push("Turn on your emergency hazard warning lights and steer safely to the shoulder or curb.");
    safetySteps.push("Engage your parking brake firmly and stay inside or stand behind a roadside barrier.");
    safetySteps.push("Never stand between your vehicle and moving traffic while awaiting assistance.");
  } else {
    safetySteps.push("Park safely on level ground, apply the parking brake, and switch on hazard lights.");
    safetySteps.push("Ensure you and your passengers are in a well-lit and secure location away from moving lanes.");
    safetySteps.push("Do not attempt dangerous DIY repairs along fast-moving roadways.");
  }

  // Generic first-person description from user input (max 280 chars)
  let requestDescription: string | null = null;
  if (userText.trim().length > 0) {
    const clean = userText.trim().replace(/\s+/g, " ");
    requestDescription = clean.length > 280 ? clean.slice(0, 277) + "..." : clean;
  }

  // Reply message (max 600 chars)
  let reply = "";
  if (urgency === "EMERGENCY") {
    reply =
      "Your situation appears dangerous. Please prioritize your safety first. If there is injury, fire, or live traffic risk, call 999 immediately. When you are in a safe area, you can create a roadside request on RoadResQ or browse nearby mechanics.";
  } else if (suggestedSkills.length > 0) {
    reply = `Based on your description, this is likely related to ${suggestedSkills.join(
      ", "
    )}. Please ensure your hazard lights are on and you are in a safe spot. You can start a request with this description to connect with a nearby mechanic.`;
  } else {
    reply =
      "Please park safely, turn on your hazard lights, and stay away from moving traffic. You can start a request or browse nearby mechanics to get professional roadside help.";
  }

  const followUps =
    urgency === "EMERGENCY"
      ? ["Are you in a safe location off the road?", "Do you need police or an ambulance (call 999)?"]
      : ["Find a nearby mechanic", "Start request with this description"];

  return {
    data: {
      reply,
      urgency,
      safetySteps: safetySteps.slice(0, 4),
      suggestedSkills,
      requestDescription,
      followUps: followUps.slice(0, 2),
    },
    source: "rules",
    redacted: wasRedacted,
  };
}
