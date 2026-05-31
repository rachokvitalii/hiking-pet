import { pgTable, serial, text, timestamp, varchar, index, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { users } from "./users-schema";
import { tripTypeEnum } from "./enums";
import { experienceLevelEnum } from "./enums";
import { seasonEnum } from "./enums";
import { recommendationStatusEnum } from "./enums";

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

export const routeRecommendations = pgTable(
  "route_recommendations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: recommendationStatusEnum("status").notNull().default("pending"),
    model: varchar("model", { length: 128 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    error: text("error"),
  },
  (table) => [index("route_recommendations_user_id_idx").on(table.userId)],
);

export const routeRecommendationItems = pgTable(
  "route_recommendation_items",
  {
    id: serial("id").primaryKey(),
    recommendationId: integer("recommendation_id")
      .notNull()
      .references(() => routeRecommendations.id, { onDelete: "cascade" }),
    routeId: integer("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    reason: text("reason"),
    score: integer("score"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("route_recommendation_items_recommendation_id_idx").on(
      table.recommendationId,
    ),
    index("route_recommendation_items_route_id_idx").on(table.routeId),
    uniqueIndex("route_recommendation_items_recommendation_route_unique").on(
      table.recommendationId,
      table.routeId,
    ),
    uniqueIndex("route_recommendation_items_recommendation_position_unique").on(
      table.recommendationId,
      table.position,
    ),
  ],
);