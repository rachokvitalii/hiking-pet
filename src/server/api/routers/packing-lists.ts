import { and, eq } from "drizzle-orm";
import { packingList } from "~/server/db/packing-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { packingListSchema } from "~/features/packing-lists/schemas/packing-list-schema";
import z from "zod";

export const packingListsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.userId)

    const packingLists = await ctx.db.select().from(packingList).where(eq(packingList.userId, userId))

    return packingLists ?? []
  }),
  create: protectedProcedure.input(packingListSchema).mutation(async ({ ctx, input }) => {
    const userId = Number(ctx.userId)

    const [newPackingList] = await ctx.db.insert(packingList).values({
      ...input,
      userId,
    }).returning()

    return newPackingList
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const userId = Number(ctx.userId)

    await ctx.db.delete(packingList).where(and(eq(packingList.id, input.id), eq(packingList.userId, userId)))
  })
});