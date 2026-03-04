'use server'

import { signOut } from "~/server/auth"

export const SignOutAction = async () => {
  await signOut()
}