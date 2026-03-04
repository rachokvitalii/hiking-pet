import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { users } from "./users-schema";
import { relations } from "drizzle-orm";

export const userProfile = pgTable('user_profile', {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text("display_name"),
  homeRegion: text("home_region"),
  experienceLevel: text("experience_level"),
  preferredHikeType: text("preferred_hike_type"),
  maxDailyKm: integer("max_daily_km"),
  gear: jsonb("gear").$type<string[]>(),
})

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(users, {
    fields: [userProfile.userId],
    references: [users.id]
  })
}))