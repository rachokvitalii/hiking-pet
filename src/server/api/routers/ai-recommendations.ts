import { asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  routeRecommendationItems,
  routeRecommendations,
  routes,
} from "~/server/db/routes-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const aiRecommendationRoute = createTRPCRouter({
  getRecommendations: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = Number(ctx.userId);

    const result = await ctx.db.transaction(async (tx) => {
      /// some AI logic here
      const recommendedRoutes = await tx
        .select()
        .from(routes)
        .orderBy(asc(routes.id))
        .limit(3);

      if (recommendedRoutes.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No routes available for recommendations",
        });
      }

      const now = new Date();
      const [recommendation] = await tx
        .insert(routeRecommendations)
        .values({
          userId,
          status: "completed",
          model: "gpt-4o-mini",
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
        recommendedRoutes.map((route, index) => ({
          recommendationId: recommendation.id,
          routeId: route.id,
          position: index + 1,
          reason: `Fake recommendation for ${route.title}`,
          score: 100 - index * 10,
          createdAt: now,
        })),
      );

      return {
        recommendationId: recommendation.id,
        routes: recommendedRoutes,
      };
    });

    return {
      recommendationId: result.recommendationId,
      data: result.routes,
    };
  }),
});
