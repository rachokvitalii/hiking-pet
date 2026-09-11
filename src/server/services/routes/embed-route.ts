import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { eq } from "drizzle-orm";

import { env } from "~/env";
import { db } from "~/server/db";
import { routes } from "~/server/db/schema";
import {
  ROUTE_EMBEDDING_DIMENSIONS,
  buildRouteEmbeddingDocument,
  getRouteEmbeddingSourceHash,
  type RouteEmbeddingDocumentInput,
} from "~/server/services/routes/embedding-documents";

const routeEmbeddingColumns = {
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
} satisfies Record<string, unknown>;

export type RouteEmbeddingTarget = RouteEmbeddingDocumentInput & {
  id: number;
};

export async function getRouteEmbeddingTarget(routeId: number) {
  const [route] = await db
    .select(routeEmbeddingColumns)
    .from(routes)
    .where(eq(routes.id, routeId))
    .limit(1);

  return route ?? null;
}

export async function embedRouteById(routeId: number): Promise<void> {
  const route = await getRouteEmbeddingTarget(routeId);

  if (!route) {
    throw new Error(`Route ${routeId} was not found`);
  }

  await embedRoute(route);
}

export async function embedRoute(route: RouteEmbeddingTarget) {
  const sourceHash = getRouteEmbeddingSourceHash(route);
  const document = buildRouteEmbeddingDocument(route);
  const { embedding, usage } = await embed({
    model: openai.embedding(env.OPENAI_EMBEDDING_MODEL),
    value: document,
  });

  if (embedding.length !== ROUTE_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${ROUTE_EMBEDDING_DIMENSIONS} embedding dimensions, got ${embedding.length}`,
    );
  }

  await db
    .update(routes)
    .set({
      embedding,
      embeddingModel: env.OPENAI_EMBEDDING_MODEL,
      embeddingSourceHash: sourceHash,
      embeddingUpdatedAt: new Date(),
    })
    .where(eq(routes.id, route.id));

  return {
    routeId: route.id,
    sourceHash,
    model: env.OPENAI_EMBEDDING_MODEL,
    tokens: usage.tokens,
  };
}
