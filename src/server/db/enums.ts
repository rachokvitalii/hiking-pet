import { pgEnum } from "drizzle-orm/pg-core";

export const tripTypeEnum = pgEnum("trip_type", [
  "hiking",
  "camping",
  "bike_ride",
]);

export const gearCategoryEnum = pgEnum("gear_category", [
  "bivouac",
  "kitchen",
  "hygiene",
  "gear",
  "navigation",
  "electronics",
  "documents_money",
  "other",
  "clothing_footwear",
  "first_aid",
  "food",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const seasonEnum = pgEnum("season", [
  "spring",
  "summer",
  "autumn",
  "winter",
]);