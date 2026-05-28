import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { users } from "./users-schema";

export const userProfile = pgTable("user_profile", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  homeRegion: text("home_region"),
  experienceLevel: text("experience_level"),
  preferredTripDuration: text("preferred_trip_duration"),
  maxDailyKm: integer("max_daily_km"),
  gear: jsonb("gear").$type<string[]>(),
});
