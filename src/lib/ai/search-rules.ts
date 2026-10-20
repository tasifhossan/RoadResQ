import { SKILLS } from "./vocab";
import type { MechanicSkill } from "@/lib/validations/public";
import { Availability } from "@/lib/api/types";

export interface SearchIntentData {
  skills: MechanicSkill[];
  availability: Availability | null;
  minRating: 3 | 3.5 | 4 | 4.5 | null;
  sortBy: "rating" | "totalJobs" | "yearsExperience" | "newest" | null;
  city: string | null;
  explanation: string;
}

export interface SearchIntentRulesResult {
  data: SearchIntentData;
  source: "rules";
  redacted: boolean;
}

export function getRuleBasedSearchIntent(
  query: string,
  availableSkills: string[],
  availableCities: string[],
  wasRedacted = false
): SearchIntentRulesResult {
  const lower = query.toLowerCase();

  // 1. Skill keyword mapping (only select skills that are in availableSkills)
  const skills: MechanicSkill[] = [];
  const maybeAddSkill = (skill: MechanicSkill) => {
    if (
      !skills.includes(skill) &&
      (availableSkills.length === 0 || availableSkills.includes(skill)) &&
      (SKILLS as readonly string[]).includes(skill)
    ) {
      skills.push(skill);
    }
  };

  if (
    lower.includes("battery") ||
    lower.includes("jump") ||
    lower.includes("click") ||
    lower.includes("dead") ||
    lower.includes("start")
  ) {
    maybeAddSkill("Battery");
    maybeAddSkill("Battery Jumpstart");
  }

  if (
    lower.includes("tire") ||
    lower.includes("tyre") ||
    lower.includes("flat") ||
    lower.includes("puncture") ||
    lower.includes("wheel")
  ) {
    maybeAddSkill("Tire");
    maybeAddSkill("Tire Change");
  }

  if (
    lower.includes("overheat") ||
    lower.includes("steam") ||
    lower.includes("smoke") ||
    lower.includes("engine") ||
    lower.includes("hood") ||
    lower.includes("noise")
  ) {
    maybeAddSkill("Engine");
    maybeAddSkill("Engine Repair");
  }

  if (
    lower.includes("tow") ||
    lower.includes("stuck") ||
    lower.includes("accident") ||
    lower.includes("ditch") ||
    lower.includes("pull")
  ) {
    maybeAddSkill("Towing");
  }

  if (lower.includes("lock") || lower.includes("key") || lower.includes("locked")) {
    maybeAddSkill("Lockout");
  }

  if (
    lower.includes("fuel") ||
    lower.includes("petrol") ||
    lower.includes("diesel") ||
    lower.includes("empty") ||
    lower.includes("gas")
  ) {
    maybeAddSkill("Fuel Delivery");
  }

  if (lower.includes("brake") || lower.includes("pad") || lower.includes("stopping")) {
    maybeAddSkill("Brakes");
    maybeAddSkill("Brake Service");
  }

  if (lower.includes("ac") || lower.includes("air condition") || lower.includes("cooling")) {
    maybeAddSkill("AC");
  }

  if (
    lower.includes("electrical") ||
    lower.includes("fuse") ||
    lower.includes("light") ||
    lower.includes("wire")
  ) {
    maybeAddSkill("Electrical");
  }

  if (
    lower.includes("transmission") ||
    lower.includes("gear") ||
    lower.includes("gearbox") ||
    lower.includes("clutch")
  ) {
    maybeAddSkill("Transmission");
  }

  // 2. Availability matching
  let availability: Availability | null = null;
  if (
    lower.includes("available now") ||
    lower.includes("available") ||
    lower.includes("right now") ||
    lower.includes("immediately") ||
    lower.includes("ready") ||
    lower.includes("free now")
  ) {
    availability = "AVAILABLE";
  } else if (lower.includes("busy")) {
    availability = "BUSY";
  }

  // 3. Rating & SortBy matching
  let minRating: 3 | 3.5 | 4 | 4.5 | null = null;
  let sortBy: "rating" | "totalJobs" | "yearsExperience" | "newest" | null = null;

  if (
    lower.includes("best rated") ||
    lower.includes("top rated") ||
    lower.includes("highest rating") ||
    lower.includes("top mechanic")
  ) {
    minRating = 4;
    sortBy = "rating";
  } else if (lower.includes("4.5") || lower.includes("5 star")) {
    minRating = 4.5;
    sortBy = "rating";
  } else if (lower.includes("4 star")) {
    minRating = 4;
  } else if (lower.includes("3.5")) {
    minRating = 3.5;
  }

  if (
    lower.includes("most experienced") ||
    lower.includes("experience") ||
    lower.includes("veteran") ||
    lower.includes("senior")
  ) {
    sortBy = "yearsExperience";
  } else if (
    lower.includes("most jobs") ||
    lower.includes("most popular") ||
    lower.includes("most active")
  ) {
    sortBy = "totalJobs";
  } else if (lower.includes("newest") || lower.includes("recent")) {
    sortBy = "newest";
  }

  // 4. City matching from availableCities
  let matchedCity: string | null = null;
  for (const city of availableCities) {
    if (city && lower.includes(city.toLowerCase())) {
      matchedCity = city;
      break;
    }
  }

  // 5. Generate concise explanation (max 140 chars)
  const parts: string[] = [];
  if (skills.length > 0) parts.push(`skill: ${skills.slice(0, 3).join(", ")}`);
  if (matchedCity) parts.push(`city: ${matchedCity}`);
  if (availability) parts.push(`status: ${availability}`);
  if (minRating) parts.push(`min rating: ${minRating}★`);
  if (sortBy) parts.push(`sort: ${sortBy}`);

  const explanation =
    parts.length > 0
      ? `Filters matched based on your query: ${parts.join(" • ")}`.slice(0, 140)
      : "Found relevant search terms based on your request.".slice(0, 140);

  return {
    data: {
      skills: skills.slice(0, 3),
      availability,
      minRating,
      sortBy,
      city: matchedCity,
      explanation,
    },
    source: "rules",
    redacted: wasRedacted,
  };
}
