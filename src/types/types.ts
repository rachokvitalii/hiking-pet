export type Issues = Array<{ path: PropertyKey[]; message: string }>

export type AuthActionRes = { ok: true } | { ok: false, issues: Issues }

export const HIKE_TYPES = ["one_day", "multy_day", "trail_running"] as const;
export type HikeType = typeof HIKE_TYPES[number];

export const HIKE_TYPE_LABEL: Record<HikeType, string> = {
  one_day: "One Day",
  multy_day: "Multi Day",
  trail_running: "Trail Running",
};

export const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];

export const EXPERIENCE_LEVEL_LABEL: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};