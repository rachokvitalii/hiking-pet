import { eq, desc, and, asc } from "drizzle-orm";
import z from "zod";
import { TRPCError } from "@trpc/server";

import {
  routeRecommendationItems,
  routeRecommendations,
  routes,
} from "~/server/db/routes-schema";
import { userProfile } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { rankRoutesForRecommendation } from "~/server/services/route-recommendations/ranking";
import { generateRouteRecommendationsWithAI } from "~/server/services/route-recommendations/agent";

export const aiRecommendationRoute = createTRPCRouter({
  createRecommendations: protectedProcedure.mutation(async ({ ctx }) => {
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
        return {
          ...route,
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
          title: aiRecommendationResult.title,
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
  getRecommendedCollections: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.userId);

    const recommendations = await ctx.db
      .select({
        id: routeRecommendations.id,
        title: routeRecommendations.title,
        status: routeRecommendations.status,
        createdAt: routeRecommendations.createdAt,
        completedAt: routeRecommendations.completedAt,
      })
      .from(routeRecommendations)
      .where(eq(routeRecommendations.userId, userId))
      .orderBy(desc(routeRecommendations.createdAt));

    return recommendations;
  }),
  getRecommendedRoutes: protectedProcedure
    .input(z.object({ recommendationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { recommendationId } = input;
      const userId = Number(ctx.userId);

      const [recommendation] = await ctx.db
        .select({ id: routeRecommendations.id })
        .from(routeRecommendations)
        .where(
          and(
            eq(routeRecommendations.id, recommendationId),
            eq(routeRecommendations.userId, userId),
          ),
        )
        .limit(1);

      if (!recommendation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recommendation not found",
        });
      }

      const recommendedRoutes = await ctx.db
        .select({
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
          createdAt: routes.createdAt,
          updatedAt: routes.updatedAt,
          recommendationReason: routeRecommendationItems.reason,
          recommendationScore: routeRecommendationItems.score,
          recommendationPosition: routeRecommendationItems.position,
        })
        .from(routeRecommendationItems)
        .innerJoin(routes, eq(routeRecommendationItems.routeId, routes.id))
        .where(eq(routeRecommendationItems.recommendationId, recommendation.id))
        .orderBy(asc(routeRecommendationItems.position));

      return recommendedRoutes.map(
        ({
          recommendationReason,
          recommendationScore,
          recommendationPosition,
          ...route
        }) => ({
          ...route,
          recommendation: {
            reason: recommendationReason,
            score: recommendationScore,
            position: recommendationPosition,
          },
        }),
      );
    }),
});
