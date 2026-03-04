'use server';

import { type AuthActionRes } from "~/types/types"
import { type ChangePasswordInput, changePasswordSchema } from "./validation"
import { auth } from "~/server/auth"
import { db } from "~/server/db"
import { users } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { compare, hash } from "bcrypt"

export const changePasswordAction = async (data: ChangePasswordInput): Promise<AuthActionRes> => {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      ok: false,
      issues: [{ path: [], message: 'Session do not exist' }]
    }
  }

  const parsed = changePasswordSchema.safeParse(data)

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues
    }
  }

  const [user] = await db.select().from(users).where(eq(users.id, parseInt(session.user.id)))

  if (!user) {
    return {
      ok: false,
      issues: [{ path: [], message: 'User not found' }]
    }
  }

  const passwordMatch = await compare(parsed.data.currentPassword, user.password!)

  if (!passwordMatch) {
    return {
      ok: false,
      issues: [{ path: ['currentPassword'], message: 'Current passwords is incorrect' }]
    }
  }

  const hashedPassword = await hash(parsed.data.password, 10)

  await db.update(users).set({
    password: hashedPassword
  }).where(eq(users.id, parseInt(session.user.id)))

  return {
    ok: true
  }
}