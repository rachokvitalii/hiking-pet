import { desc, eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { routes } from "~/server/db/routes-schema";
import z from "zod";

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
});
