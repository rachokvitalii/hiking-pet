import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "~/server/db";
import { routes, userProfile } from "~/server/db/schema";
import { cacheLife } from "next/cache";

type AssistantRouteContext = {
  id: number;
  title: string;
  url: string;
  description: string;
  region: string;
  type: string[];
  difficulty: string;
  distanceKm: number;
  days: number;
  elevationGain: number;
  seasons: string[];
};

type AssistantUserProfileContext = {
  homeRegion: string | null;
  experienceLevel: string | null;
  preferredTripDuration: string | null;
  maxDailyKm: number | null;
};

export async function buildAssistantContext({ userId }: { userId: number }) {
  const [profile = null] = await db
    .select({
      homeRegion: userProfile.homeRegion,
      experienceLevel: userProfile.experienceLevel,
      preferredTripDuration: userProfile.preferredTripDuration,
      maxDailyKm: userProfile.maxDailyKm,
    })
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  const routeContexts = await getAssistantRouteContexts();

  return formatAssistantContext({
    userProfile: profile,
    routes: routeContexts,
  });
}

async function getAssistantRouteContexts(): Promise<AssistantRouteContext[]> {
  "use cache";
  cacheLife("max");

  const routeRows = await db
    .select({
      id: routes.id,
      title: routes.title,
      description: routes.description,
      region: routes.region,
      type: routes.type,
      difficulty: routes.difficulty,
      distanceKm: routes.distanceKm,
      days: routes.days,
      elevationGain: routes.elevationGain,
      seasons: routes.seasons,
    })
    .from(routes)
    .orderBy(asc(routes.id));

  return routeRows.map((route) => ({
    id: route.id,
    title: route.title,
    url: `/routes/${route.id}`,
    description: route.description,
    region: route.region,
    type: route.type,
    difficulty: route.difficulty,
    distanceKm: route.distanceKm,
    days: route.days,
    elevationGain: route.elevationGain,
    seasons: route.seasons,
  }));
}

function formatAssistantContext(context: {
  userProfile: AssistantUserProfileContext | null;
  routes: AssistantRouteContext[];
}) {
  return [
    "Current application data:",
    JSON.stringify(context, null, 2),
  ].join("\n");
}
