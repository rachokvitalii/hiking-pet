import type { InferSelectModel } from "drizzle-orm";
import type { routes } from "~/server/db/schema";
import type { ExperienceLevel, TripType } from "~/types/types";

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export type RouteRow = InferSelectModel<typeof routes>;

export type Route = {
  id: number;
  slug: string;
  title: string;
  description: string;
  region: string;
  type: TripType[];
  difficulty: ExperienceLevel;
  latitude: number;
  longitude: number;
  distanceKm: number;
  days: number;
  elevationGain: number;
  seasons: Season[];
  createdAt: Date;
  updatedAt: Date;
};

export type RankedRoute = {
  route: Route;
  score: number;
  reason: string;
  weatherContext: string | null;
};

export type RouteRecommendation = Route & Omit<RankedRoute, "route">;