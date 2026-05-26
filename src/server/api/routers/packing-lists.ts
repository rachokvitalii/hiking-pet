import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  gearCatalogItems,
  packingListItems,
  packingLists,
} from "~/server/db/packing-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { packingListSchema } from "~/features/packing-lists/schemas/packing-list-schema";
import z from "zod";

export const packingListsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.userId);

    const lists = await ctx.db
      .select()
      .from(packingLists)
      .where(eq(packingLists.userId, userId));

    return lists ?? [];
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.userId);

      const [list] = await ctx.db
        .select()
        .from(packingLists)
        .where(
          and(eq(packingLists.id, input.id), eq(packingLists.userId, userId)),
        )
        .limit(1);

      return list ?? null;
    }),
  getItems: protectedProcedure
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
  create: protectedProcedure
    .input(packingListSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.userId);

      const [newList] = await ctx.db
        .insert(packingLists)
        .values({
          ...input,
          userId,
        })
        .returning();

      return newList;
    }),
  update: protectedProcedure
    .input(packingListSchema.pick({ title: true }).extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.userId);
      const { id, title } = input;

      const [updated] = await ctx.db
        .update(packingLists)
        .set({ title, updatedAt: new Date() })
        .where(and(eq(packingLists.id, id), eq(packingLists.userId, userId)))
        .returning();

      return updated;
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
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.userId);

      await ctx.db
        .delete(packingLists)
        .where(
          and(eq(packingLists.id, input.id), eq(packingLists.userId, userId)),
        );
    }),
});
