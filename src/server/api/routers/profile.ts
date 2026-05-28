import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { changePasswordSchema } from "~/app/(protected)/settings/components/change-password/validation";
import { profileSchema } from "~/app/(protected)/settings/components/profile/validation";
import { db } from "~/server/db";
import { userProfile, users } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
        preferredTripDuration: input.preferredTripDuration ?? null,
        maxDailyKm: input.maxDailyKm ?? null,
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
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const [user] = await db.select().from(users).where(eq(users.id, Number(ctx.userId)))

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
      }

      const passwordMatch = await compare(input.currentPassword, user.password!)

      if (!passwordMatch) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" })
      }

      const hashedPassword = await hash(input.password, 10)

      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, Number(ctx.userId)))
    }),
})