'use server';

import { db } from "~/server/db";
import { type RegisterFormInput, formSchema } from "./validation";
import { hash } from 'bcrypt'
import { users } from "~/server/db/schema";
import { type AuthActionRes } from "~/types/types";

type PgErrorLike = {
  cause: {
    code?: string; // '23505'
  }
};

export const registerAction = async (data: RegisterFormInput): Promise<AuthActionRes> => {
  const parsed = formSchema.safeParse(data)
        
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues
    }
  }

  const { email, password } = parsed.data

  const hashedPassword = await hash(password, 10)

  try {
    await db.insert(users).values({
      email,
      password: hashedPassword,
    })
  } catch (e: unknown) {
    const error = e as PgErrorLike

    if (error.cause.code === '23505') {
      return {
        ok: false,
        issues: [{ path: ["email"], message: "User with this email already exists" }]
      }
    }

    return {
      ok: false,
      issues: [{ path: [], message: "Something went wrong. Please try again later." }],
    }
  }


  return { ok: true }
}
