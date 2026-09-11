import { z } from "zod";

import { htmlToPlainText } from "~/lib/html-to-plain-text";
import { SEASONS } from "~/features/routes/types";
import { EXPERIENCE_LEVELS, TRIP_TYPES } from "~/types/types";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(128, "Slug must be at most 128 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single dashes",
  );

const routeContentSchema = z.object({
  slug: slugSchema,
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(128, "Title must be at most 128 characters"),
  description: z
    .string()
    .trim()
    .refine((value) => htmlToPlainText(value).length > 0, {
      message: "Description is required",
    }),
  region: z
    .string()
    .trim()
    .min(1, "Region is required")
    .max(128, "Region must be at most 128 characters"),
  type: z.array(z.enum(TRIP_TYPES)).min(1, "Select at least one route type"),
  difficulty: z.enum(EXPERIENCE_LEVELS),
  latitude: z
    .number()
    .min(-90, "Latitude must be at least -90")
    .max(90, "Latitude must be at most 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be at least -180")
    .max(180, "Longitude must be at most 180"),
  distanceKm: z
    .number()
    .int("Distance must be a whole number")
    .positive("Distance must be greater than 0"),
  days: z
    .number()
    .int("Days must be a whole number")
    .positive("Days must be greater than 0"),
  elevationGain: z
    .number()
    .int("Elevation gain must be a whole number")
    .min(0, "Elevation gain cannot be negative"),
  seasons: z.array(z.enum(SEASONS)).min(1, "Select at least one season"),
});

export const createRouteSchema = routeContentSchema;

export const updateRouteSchema = routeContentSchema.extend({
  id: z.number().int().positive(),
});

export const routeIdSchema = z.object({
  id: z.number().int().positive(),
});

export type RouteFormInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
