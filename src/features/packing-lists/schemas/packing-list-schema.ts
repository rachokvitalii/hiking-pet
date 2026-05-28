import z from "zod";
import { TRIP_TYPES } from "~/types/types";

export const packingListSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.enum(TRIP_TYPES),
})

export type PackingListSchema = z.infer<typeof packingListSchema>