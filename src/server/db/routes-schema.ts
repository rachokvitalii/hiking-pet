import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { tripTypeEnum } from "./enums";
import { experienceLevelEnum } from "./enums";
import { seasonEnum } from "./enums";

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description").notNull(),
  region: varchar("region", { length: 128 }).notNull(),
  type: tripTypeEnum("type").array().notNull(),
  difficulty: experienceLevelEnum("difficulty").notNull(),
  distanceKm: integer("distance_km").notNull(),
  days: integer("days").notNull(),
  elevationGain: integer("elevation_gain").notNull(),
  seasons: seasonEnum("seasons").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
