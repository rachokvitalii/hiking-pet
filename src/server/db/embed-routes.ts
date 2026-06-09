import { config } from "dotenv";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { eq } from "drizzle-orm";

import { routes } from "~/server/db/schema";
import {
  ROUTE_EMBEDDING_DIMENSIONS,
  buildRouteEmbeddingDocument,
  getRouteEmbeddingSourceHash,
} from "~/server/services/ai-assistant/route-documents";

const nodeEnv = process.env.NODE_ENV ?? "development";
const envFiles = [
  `.env.${nodeEnv}.local`,
  nodeEnv !== "test" ? ".env.local" : null,
  `.env.${nodeEnv}`,
  ".env",
].filter((file): file is string => Boolean(file));

for (const path of envFiles) {
  config({ path, override: false, quiet: true });
}

async function embedRoutes() {
  const [{ db }, { env }] = await Promise.all([
    import("~/server/db"),
    import("~/env"),
  ]);

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
      embedding: routes.embedding,
      embeddingModel: routes.embeddingModel,
      embeddingSourceHash: routes.embeddingSourceHash,
    })
    .from(routes);

  const routesToEmbed = routeRows
    .map((route) => {
      const document = buildRouteEmbeddingDocument(route);
      const sourceHash = getRouteEmbeddingSourceHash(route);

      return {
        route,
        document,
        sourceHash,
      };
    })
    .filter(({ route, sourceHash }) => {
      return (
        route.embedding === null ||
        route.embeddingModel !== env.OPENAI_EMBEDDING_MODEL ||
        route.embeddingSourceHash !== sourceHash
      );
    });

  if (routesToEmbed.length === 0) {
    console.log("Route embeddings: already up to date");
    return;
  }

  const { embeddings, usage } = await embedMany({
    model: openai.embedding(env.OPENAI_EMBEDDING_MODEL),
    values: routesToEmbed.map(({ document }) => document),
  });

  for (const [index, routeData] of routesToEmbed.entries()) {
    const embedding = embeddings[index];

    if (!embedding) {
      throw new Error(`Missing embedding for route ${routeData.route.id}`);
    }

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
        embeddingSourceHash: routeData.sourceHash,
        embeddingUpdatedAt: new Date(),
      })
      .where(eq(routes.id, routeData.route.id));
  }

  console.log(
    `Route embeddings: updated ${routesToEmbed.length} route(s), ${usage.tokens} token(s)`,
  );
}

embedRoutes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Route embeddings: ERROR", error);
    process.exit(1);
  });
