export type Issues = Array<{ path: PropertyKey[]; message: string }>;

export type AuthActionRes = { ok: true } | { ok: false; issues: Issues };

export const TRIP_TYPES = ["hiking", "camping", "bike_ride"] as const;
export type TripType = (typeof TRIP_TYPES)[number];

export const TRIP_DURATIONS = ["one_day", "multy_day"] as const;
export type TripDuration = (typeof TRIP_DURATIONS)[number];

export const TRIP_DURATIONS_LABEL: Record<TripDuration, string> = {
  one_day: "One Day",
  multy_day: "Multi Day",
};

export const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LEVEL_LABEL: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
