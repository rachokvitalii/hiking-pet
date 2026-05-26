import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  gearCatalogItems,
  gearCategories,
  packingListItems,
  packingLists,
} from "~/server/db/packing-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const gearCatalogRouter = createTRPCRouter({
  // all existing categories, e.g. food, clothing, equipment, etc.
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

  // all existing catalog items, e.g. tent, sleeping bag, etc.
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

  // all existing catalog items for a specific packing list (checked items)
  getCheckedItems: protectedProcedure
    .input(z.object({ listId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.userId);

      return ctx.db
        .select({
          id: packingListItems.id,
          catalogItemId: packingListItems.catalogItemId,
        })
        .from(packingListItems)
        .innerJoin(
          packingLists,
          eq(packingListItems.packingListId, packingLists.id),
        )
        .where(
          and(
            eq(packingListItems.packingListId, input.listId),
            eq(packingLists.userId, userId),
          ),
        );
    }),

  setCatalogItemIncluded: protectedProcedure
    .input(
      z.object({
        listId: z.number(),
        catalogItemId: z.number(),
        included: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.userId);

      const [list] = await ctx.db
        .select({ id: packingLists.id })
        .from(packingLists)
        .where(
          and(
            eq(packingLists.id, input.listId),
            eq(packingLists.userId, userId),
          ),
        )
        .limit(1);

      if (!list) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!input.included) {
        await ctx.db
          .delete(packingListItems)
          .where(
            and(
              eq(packingListItems.packingListId, input.listId),
              eq(packingListItems.catalogItemId, input.catalogItemId),
            ),
          );

        return input;
      }

      const [catalogItem] = await ctx.db
        .select({
          id: gearCatalogItems.id,
          categoryId: gearCatalogItems.categoryId,
          key: gearCatalogItems.key,
          sortOrder: gearCatalogItems.sortOrder,
        })
        .from(gearCatalogItems)
        .where(eq(gearCatalogItems.id, input.catalogItemId))
        .limit(1);

      if (!catalogItem) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [existingItem] = await ctx.db
        .select({ id: packingListItems.id })
        .from(packingListItems)
        .where(
          and(
            eq(packingListItems.packingListId, input.listId),
            eq(packingListItems.catalogItemId, input.catalogItemId),
          ),
        )
        .limit(1);

      if (existingItem) {
        await ctx.db
          .update(packingListItems)
          .set({ updatedAt: new Date() })
          .where(eq(packingListItems.id, existingItem.id));

        return input;
      }

      await ctx.db.insert(packingListItems).values({
        packingListId: input.listId,
        categoryId: catalogItem.categoryId,
        catalogItemId: catalogItem.id,
        name: catalogItem.key,
        isChecked: false,
        sortOrder: catalogItem.sortOrder,
      });

      return input;
    }),
});
