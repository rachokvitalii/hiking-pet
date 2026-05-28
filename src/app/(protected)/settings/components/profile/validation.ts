import z from "zod";
import { EXPERIENCE_LEVELS, TRIP_DURATIONS } from "~/types/types";

export const profileSchema = z.object({
  displayName: z.string().min(2).max(64).nullable().optional(),
  homeRegion: z.string().max(64).nullable().optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).nullable().optional(),
  preferredTripDuration: z.enum(TRIP_DURATIONS).nullable().optional(),
  maxDailyKm: z.number().int().min(1).max(100).nullable().optional(),
  // TODO: delete gear from profile schema
  gear: z.array(z.string().min(1).max(64)).max(100).nullable().optional(),
})

export type ProfileSchema = z.infer<typeof profileSchema>