export type Issues = Array<{ path: PropertyKey[]; message: string }>

export type AuthActionRes = { ok: true } | { ok: false, issues: Issues }

export const HIKE_TYPE_LABEL: Record<string, string> = {
  one_day: "One Day",
  multy_day: "Multi Day",
  trail_running: "Trail Running",
} as const;
