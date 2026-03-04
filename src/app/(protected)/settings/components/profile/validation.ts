import z from "zod";

export const profileSchema = z.object({
  displayName: z.string().min(2).max(64).nullable().optional(),
  homeRegion: z.string().max(64).nullable().optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).nullable().optional(),
  preferredHikeType: z.enum(["one_day", "multy_day", "trail_running"]).nullable().optional(),
  maxDailyKm: z.number().int().min(1).max(100).nullable().optional(),
  gear: z.array(z.string().min(1).max(64)).max(100).nullable().optional(),
})

export type ProfileSchema = z.infer<typeof profileSchema>