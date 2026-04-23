import z from "zod";
import { EXPERIENCE_LEVELS, HIKE_TYPES } from "~/types/types";

export const profileSchema = z.object({
  displayName: z.string().min(2).max(64).nullable().optional(),
  homeRegion: z.string().max(64).nullable().optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).nullable().optional(),
  preferredHikeType: z.enum(HIKE_TYPES).nullable().optional(),
  maxDailyKm: z.number().int().min(1).max(100).nullable().optional(),
  gear: z.array(z.string().min(1).max(64)).max(100).nullable().optional(),
})

export type ProfileSchema = z.infer<typeof profileSchema>