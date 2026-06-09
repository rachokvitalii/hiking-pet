import "server-only";

import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { cosineDistance } from "drizzle-orm/sql/functions/vector";

import { env } from "~/env";
import { db } from "~/server/db";
import { routes } from "~/server/db/schema";
import { ROUTE_EMBEDDING_DIMENSIONS } from "~/server/services/routes/embedding-documents";

export const ROUTE_RETRIEVAL_LIMIT = 5;
const ROUTE_FALLBACK_LIMIT = 8;

export type AssistantRouteContext = {
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

export type AssistantRouteRetrievalContext = {
  status: "vector" | "fallback";
  query: string;
  model: string;
  reason: string | null;
  routes: AssistantRouteContext[];
};

type RouteRow = Omit<AssistantRouteContext, "url">;

export async function retrieveAssistantRouteContexts({
  query,
}: {
  query: string;
}): Promise<AssistantRouteRetrievalContext> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return createFallbackRouteRetrievalContext({
      query: normalizedQuery,
      reason: "The conversation did not contain searchable route intent.",
    });
  }

  try {
    const { embedding } = await embed({
      model: openai.embedding(env.OPENAI_EMBEDDING_MODEL),
      value: normalizedQuery,
    });

    if (embedding.length !== ROUTE_EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${ROUTE_EMBEDDING_DIMENSIONS} embedding dimensions, got ${embedding.length}`,
      );
    }

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
      .where(
        and(
          isNotNull(routes.embedding),
          eq(routes.embeddingModel, env.OPENAI_EMBEDDING_MODEL),
        ),
      )
      .orderBy(cosineDistance(routes.embedding, embedding))
      .limit(ROUTE_RETRIEVAL_LIMIT);

    if (routeRows.length === 0) {
      return createFallbackRouteRetrievalContext({
        query: normalizedQuery,
        reason:
          "No route embeddings are available yet. Run pnpm db:embed:routes after migrations.",
      });
    }

    return {
      status: "vector",
      query: normalizedQuery,
      model: env.OPENAI_EMBEDDING_MODEL,
      reason: null,
      routes: routeRows.map(formatAssistantRouteContext),
    };
  } catch {
    return createFallbackRouteRetrievalContext({
      query: normalizedQuery,
      reason:
        "Vector retrieval is currently unavailable. The assistant received a small fallback route set.",
    });
  }
}

async function createFallbackRouteRetrievalContext({
  query,
  reason,
}: {
  query: string;
  reason: string;
}): Promise<AssistantRouteRetrievalContext> {
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
    .orderBy(asc(routes.id))
    .limit(ROUTE_FALLBACK_LIMIT);

  return {
    status: "fallback",
    query,
    model: env.OPENAI_EMBEDDING_MODEL,
    reason,
    routes: routeRows.map(formatAssistantRouteContext),
  };
}

function formatAssistantRouteContext(route: RouteRow): AssistantRouteContext {
  return {
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
  };
}
