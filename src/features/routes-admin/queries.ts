import "server-only";

import { desc, eq } from "drizzle-orm";

import { env } from "~/env";
import { db } from "~/server/db";
import { routes } from "~/server/db/schema";
import { getRouteEmbeddingSourceHash } from "~/server/services/routes/embedding-documents";

const adminRouteColumns = {
  id: routes.id,
  slug: routes.slug,
  title: routes.title,
  description: routes.description,
  region: routes.region,
  type: routes.type,
  difficulty: routes.difficulty,
  latitude: routes.latitude,
  longitude: routes.longitude,
  distanceKm: routes.distanceKm,
  days: routes.days,
  elevationGain: routes.elevationGain,
  seasons: routes.seasons,
  embeddingModel: routes.embeddingModel,
  embeddingSourceHash: routes.embeddingSourceHash,
  embeddingUpdatedAt: routes.embeddingUpdatedAt,
  createdAt: routes.createdAt,
  updatedAt: routes.updatedAt,
};

export type AdminRoute = NonNullable<Awaited<ReturnType<typeof getAdminRoute>>>;
export type AdminRouteListItem = Awaited<
  ReturnType<typeof getAdminRoutes>
>[number];

export type RouteEmbeddingStatus = "ready" | "stale" | "missing";

function getEmbeddingStatus(route: {
  title: string;
  description: string;
  region: string;
  type: string[];
  difficulty: string;
  distanceKm: number;
  days: number;
  elevationGain: number;
  seasons: string[];
  embeddingModel: string | null;
  embeddingSourceHash: string | null;
  embeddingUpdatedAt: Date | null;
}): RouteEmbeddingStatus {
  if (!route.embeddingUpdatedAt || !route.embeddingSourceHash) {
    return "missing";
  }

  const currentHash = getRouteEmbeddingSourceHash(route);

  if (
    route.embeddingModel === env.OPENAI_EMBEDDING_MODEL &&
    route.embeddingSourceHash === currentHash
  ) {
    return "ready";
  }

  return "stale";
}

export async function getAdminRoutes() {
  const routeRows = await db
    .select(adminRouteColumns)
    .from(routes)
    .orderBy(desc(routes.updatedAt));

  return routeRows.map((route) => ({
    ...route,
    embeddingStatus: getEmbeddingStatus(route),
  }));
}

export async function getAdminRoute(id: number) {
  const [route] = await db
    .select(adminRouteColumns)
    .from(routes)
    .where(eq(routes.id, id))
    .limit(1);

  if (!route) {
    return null;
  }

  return {
    ...route,
    embeddingStatus: getEmbeddingStatus(route),
  };
}
