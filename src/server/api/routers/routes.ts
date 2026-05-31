import { asc, and, desc, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  routeRecommendationItems,
  routeRecommendations,
  routes,
} from "~/server/db/routes-schema";
import z from "zod";
import { TRPCError } from "@trpc/server";

export const routesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allRoutes = await ctx.db
      .select()
      .from(routes)
      .orderBy(desc(routes.createdAt));

    return allRoutes.map((route) => ({
      ...route,
      recommendation: null,
    }));
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const [route] = await ctx.db
        .select()
        .from(routes)
        .where(eq(routes.id, id))
        .limit(1);

      return route ?? null;
    }),
  getRecommendation: protectedProcedure
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
