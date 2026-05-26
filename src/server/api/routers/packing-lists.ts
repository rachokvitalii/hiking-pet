import { and, eq } from "drizzle-orm";
import { packingLists } from "~/server/db/packing-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { packingListSchema } from "~/features/packing-lists/schemas/packing-list-schema";
import z from "zod";

export const packingListsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.userId)

    const lists = await ctx.db.select().from(packingLists).where(eq(packingLists.userId, userId))

    return lists ?? []
  }),
  create: protectedProcedure.input(packingListSchema).mutation(async ({ ctx, input }) => {
    const userId = Number(ctx.userId)

    const [newList] = await ctx.db.insert(packingLists).values({
      ...input,
      userId,
    }).returning()

    return newList
  }),
  update: protectedProcedure.input(packingListSchema.extend({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const userId = Number(ctx.userId)
    const { id, ...data } = input

    const [updated] = await ctx.db
      .update(packingLists)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(packingLists.id, id), eq(packingLists.userId, userId)))
      .returning()

    return updated
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const userId = Number(ctx.userId)

    await ctx.db.delete(packingLists).where(and(eq(packingLists.id, input.id), eq(packingLists.userId, userId)))
  }),
});
