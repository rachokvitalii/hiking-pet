import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { env } from "~/env";
import {
  ROUTE_RECOMMENDATION_SYSTEM_PROMPT,
  ROUTE_RECOMMENDATION_USER_TASK,
} from "./prompts";
import type { RouteRecommendation } from "~/features/routes/types";

const RecommendationSchema = z.object({
  title: z.string(),
  recommendations: z.array(
    z.object({
      routeId: z.number().int(),
      reason: z.string(),
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
  title: string;
  recommendations: GeneratedRouteRecommendation[];
  model: string;
}> {
  const fallbackRecommendations = createFallbackRecommendations(rankedRoutes);
  const apiKey = env.OPENAI_API_KEY;

  if (!apiKey || rankedRoutes.length === 0) {
    return {
      ...fallbackRecommendations,
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
            candidates: rankedRoutes.map((route) => {
              const { createdAt, updatedAt, ...routeData } = route;

              return {
                ...routeData,
              };
            }),
          }),
        },
      ],
      text: {
        format: zodTextFormat(RecommendationSchema, "route_recommendations"),
      },
    });

    const aiRecommendations = response.output_parsed?.recommendations ?? [];
    const aiTitle = response.output_parsed?.title.trim();

    return {
      title: aiTitle
        ? truncateRecommendationTitle(aiTitle)
        : fallbackRecommendations.title,
      recommendations: mergeRecommendations({
        aiRecommendations,
        fallbackRecommendations: fallbackRecommendations.recommendations,
        rankedRoutes,
      }),
      model,
    };
  } catch {
    return {
      ...fallbackRecommendations,
      model: "rule-based-weather-v1",
    };
  }
}

function createFallbackRecommendations(rankedRoutes: RouteRecommendation[]): {
  title: string;
  recommendations: GeneratedRouteRecommendation[];
} {
  const recommendedRoutes = rankedRoutes.slice(0, 3);

  return {
    title: createFallbackRecommendationTitle(recommendedRoutes),
    recommendations: recommendedRoutes.map((route) => ({
      routeId: route.id,
      reason: route.reason ?? "Маршрут добре відповідає базовим критеріям.",
    })),
  };
}

function createFallbackRecommendationTitle(routes: RouteRecommendation[]) {
  const formattedDate = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
  }).format(new Date());
  const firstRouteTitle = routes[0]?.title;

  if (!firstRouteTitle) {
    return `Добірка від ${formattedDate}`;
  }

  const remainingRoutesCount = routes.length - 1;
  const routesSummary =
    remainingRoutesCount > 0
      ? `${firstRouteTitle} та ще ${remainingRoutesCount} ${getRouteCountLabel(remainingRoutesCount)}`
      : firstRouteTitle;

  return truncateRecommendationTitle(`${formattedDate}: ${routesSummary}`);
}

function getRouteCountLabel(count: number) {
  return count === 1 ? "маршрут" : "маршрути";
}

function truncateRecommendationTitle(title: string) {
  const maxTitleLength = 128;

  if (title.length <= maxTitleLength) return title;

  return `${title.slice(0, maxTitleLength - 1).trim()}…`;
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
