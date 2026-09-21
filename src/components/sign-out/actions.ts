"use server";

import { redirect } from "next/navigation";
import { signOut } from "~/server/auth";
import { appRoutes } from "~/shared/app-routes";

export const SignOutAction = async () => {
  await signOut({ redirect: false });
  redirect(appRoutes.login);
};
