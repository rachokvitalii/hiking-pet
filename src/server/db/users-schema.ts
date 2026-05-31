import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  password: text("password"),
  createAt: timestamp("created_at").defaultNow(),
  twoFactorSecret: text("2fa_secret"),
  twoFactorDeactivated: boolean("2fa_activated").default(false),
});

export const userProfile = pgTable("user_profile", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  homeRegion: text("home_region"),
  experienceLevel: text("experience_level"),
  preferredTripDuration: text("preferred_trip_duration"),
  maxDailyKm: integer("max_daily_km"),
});
