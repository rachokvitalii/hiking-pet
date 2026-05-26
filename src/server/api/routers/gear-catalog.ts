import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { gearCatalogItems, gearCategories } from "~/server/db/packing-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gearCatalogRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: gearCategories.id,
        key: gearCategories.key,
        sortOrder: gearCategories.sortOrder,
      })
      .from(gearCategories)
      .orderBy(asc(gearCategories.sortOrder));
  }),

  getCatalogItems: protectedProcedure
    .input(z.object({ categoryId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const baseQuery = ctx.db
        .select({
          id: gearCatalogItems.id,
          categoryId: gearCatalogItems.categoryId,
          key: gearCatalogItems.key,
          sortOrder: gearCatalogItems.sortOrder,
          isDefault: gearCatalogItems.isDefault,
        })
        .from(gearCatalogItems)
        .$dynamic();

      if (input?.categoryId) {
        baseQuery.where(eq(gearCatalogItems.categoryId, input.categoryId));
      }

      return baseQuery.orderBy(
        asc(gearCatalogItems.categoryId),
        asc(gearCatalogItems.sortOrder),
      );
    }),
});
