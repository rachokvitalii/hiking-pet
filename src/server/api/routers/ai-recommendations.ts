import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  routeRecommendationItems,
  routeRecommendations,
  routes,
} from "~/server/db/routes-schema";
import { userProfile } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { rankRoutesForRecommendation } from "~/server/services/route-ranking";
import { generateRouteRecommendationsWithAI } from "~/server/services/route-recommendation-agent";

export const aiRecommendationRoute = createTRPCRouter({
  getRecommendations: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = Number(ctx.userId);

    const [profile] = await ctx.db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    const availableRoutes = await ctx.db.select().from(routes);

    const rankedRoutes = await rankRoutesForRecommendation({
      routes: availableRoutes,
      profile: profile ?? null,
      limit: 6,
    });

    const routeCandidates = rankedRoutes.map(
      ({ route, score, reason, weatherContext }) => {
        const { createdAt, updatedAt, ...routeData } = route;

        return {
          ...routeData,
          score,
          reason,
          weatherContext,
        };
      },
    );

    const aiRecommendationResult = await generateRouteRecommendationsWithAI({
      rankedRoutes: routeCandidates,
    });
    const rankedRouteById = new Map(
      rankedRoutes.map((rankedRoute) => [rankedRoute.route.id, rankedRoute]),
    );
    const aiRecommendations = aiRecommendationResult.recommendations
      .map((recommendation) => {
        const rankedRoute = rankedRouteById.get(recommendation.routeId);

        if (!rankedRoute) return null;

        return {
          route: rankedRoute.route,
          reason: recommendation.reason,
          score: rankedRoute.score,
        };
      })
      .filter((recommendation) => recommendation !== null);

    if (aiRecommendations.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No routes available for recommendations",
      });
    }

    const result = await ctx.db.transaction(async (tx) => {
      const now = new Date();
      const [recommendation] = await tx
        .insert(routeRecommendations)
        .values({
          userId,
          status: "completed",
          model: aiRecommendationResult.model,
          completedAt: now,
        })
        .returning({ id: routeRecommendations.id });

      if (!recommendation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create route recommendation",
        });
      }

      await tx.insert(routeRecommendationItems).values(
        aiRecommendations.map((routeRecommendation, index) => ({
          recommendationId: recommendation.id,
          routeId: routeRecommendation.route.id,
          position: index + 1,
          reason: routeRecommendation.reason,
          score: routeRecommendation.score,
          createdAt: now,
        })),
      );

      return {
        recommendationId: recommendation.id,
        routes: aiRecommendations.map((recommendation) => recommendation.route),
      };
    });

    return {
      recommendationId: result.recommendationId,
      data: result.routes,
    };
  }),
});
