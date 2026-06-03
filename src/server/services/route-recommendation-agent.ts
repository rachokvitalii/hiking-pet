import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { env } from "../../env";
import {
  ROUTE_RECOMMENDATION_SYSTEM_PROMPT,
  ROUTE_RECOMMENDATION_USER_TASK,
} from "./route-recommendation-prompts";
import type { RouteRecommendation } from "~/types/types";

const RecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      routeId: z.number().int(),
      reason: z.string(),
      title: z.string(),
    }),
  ),
});

export type GeneratedRouteRecommendation = {
  routeId: number;
  reason: string;
};

export async function generateRouteRecommendationsWithAI({
  rankedRoutes,
}: {
  rankedRoutes: RouteRecommendation[];
}): Promise<{
  recommendations: GeneratedRouteRecommendation[];
  model: string;
}> {
  const fallbackRecommendations = createFallbackRecommendations(rankedRoutes);
  const apiKey = env.OPENAI_API_KEY;

  if (!apiKey || rankedRoutes.length === 0) {
    return {
      recommendations: fallbackRecommendations,
      model: "rule-based-weather-v1",
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = env.OPENAI_RECOMMENDATION_MODEL;

    const response = await client.responses.parse({
      model,
      instructions: ROUTE_RECOMMENDATION_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: JSON.stringify({
            task: ROUTE_RECOMMENDATION_USER_TASK,
            candidates: rankedRoutes.map((route) => ({
              id: route.id,
              title: route.title,
              description: route.description,
              region: route.region,
              type: route.type,
              difficulty: route.difficulty,
              distanceKm: route.distanceKm,
              days: route.days,
              elevationGain: route.elevationGain,
              seasons: route.seasons,
              ruleScore: route.score,
              ruleReason: route.reason,
              weatherContext: route.weatherContext,
            })),
          }),
        },
      ],
      text: {
        format: zodTextFormat(RecommendationSchema, "route_recommendations"),
      },
    });

    const aiRecommendations = response.output_parsed?.recommendations ?? [];

    return {
      recommendations: mergeRecommendations({
        aiRecommendations,
        fallbackRecommendations,
        rankedRoutes,
      }),
      model,
    };
  } catch {
    return {
      recommendations: fallbackRecommendations,
      model: "rule-based-weather-v1",
    };
  }
}

function createFallbackRecommendations(
  rankedRoutes: RouteRecommendation[],
): GeneratedRouteRecommendation[] {
  return rankedRoutes.slice(0, 3).map((route) => ({
    routeId: route.id,
    reason: route.reason ?? "Маршрут добре відповідає базовим критеріям.",
  }));
}

function mergeRecommendations({
  aiRecommendations,
  fallbackRecommendations,
  rankedRoutes,
}: {
  aiRecommendations: GeneratedRouteRecommendation[];
  fallbackRecommendations: GeneratedRouteRecommendation[];
  rankedRoutes: RouteRecommendation[];
}) {
  const allowedRouteIds = new Set(rankedRoutes.map((route) => route.id));
  const usedRouteIds = new Set<number>();

  const validAiRecommendations = aiRecommendations
    .filter((recommendation) => {
      if (!allowedRouteIds.has(recommendation.routeId)) return false;
      if (usedRouteIds.has(recommendation.routeId)) return false;

      usedRouteIds.add(recommendation.routeId);
      return true;
    })
    .map((recommendation) => ({
      routeId: recommendation.routeId,
      reason:
        recommendation.reason.trim() ||
        "Маршрут добре відповідає базовим критеріям.",
    }));

  return [
    ...validAiRecommendations,
    ...fallbackRecommendations.filter(
      (recommendation) => !usedRouteIds.has(recommendation.routeId),
    ),
  ].slice(0, 3);
}
