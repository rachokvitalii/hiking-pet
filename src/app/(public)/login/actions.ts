'use server'

import { type AuthActionRes } from "~/types/types"
import { type LoginFormInput, loginFormSchema } from "./validation"
import { signIn } from "~/server/auth"

type SignInResult = { error?: string; status: number; ok: boolean; url: string | null } | undefined

export const loginAction = async (data: LoginFormInput): Promise<AuthActionRes> => {
  const parsed = loginFormSchema.safeParse(data)

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues
    }
  }

  try {
    const res = await signIn('credentials', {
      ...parsed.data,
      redirect: false
    }) as SignInResult

    if (!res || res.error) {
      return {
        ok: false,
        issues: [{ path: [], message: 'Invalid credentials' }]
      }
    }

    return {
      ok: true
    }
  } catch(e: unknown) {
    const err = e as { type?: string; code?: string; kind?: string; message?: string }

    if (err?.type === "CredentialsSignin" || err?.code === "credentials") {
      return {
        ok: false,
        issues: [{ path: [], message: 'Invalid credentials' }]
      }
    }

    return {
      ok: false,
      issues: [{ path: [], message: 'Something went wrong' }]
    }
  }

}