import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userProfile } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { profileSchema } from "~/app/(protected)/settings/components/profile/validation";

export const profileRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId

    const [row] = await db.select().from(userProfile).where(eq(userProfile.userId, Number(userId)))

    return row ?? null
  }),
  updateProfile: protectedProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId

      const updatedData = {
        displayName: input.displayName ?? null,
        homeRegion: input.homeRegion ?? null,
        experienceLevel: input.experienceLevel ?? null,
        preferredHikeType: input.preferredHikeType ?? null,
        maxDailyKm: input.maxDailyKm ?? null,
        gear: input.gear ?? null,
      }

      const updated = await db
        .update(userProfile)
        .set(updatedData)
        .where(eq(userProfile.userId, Number(userId)))
        .returning()

      if (updated.length) return updated[0]

      const inserted = await db
        .insert(userProfile)
        .values({ userId: Number(userId), ...updatedData })
        .returning()

      return inserted[0]
    })
})