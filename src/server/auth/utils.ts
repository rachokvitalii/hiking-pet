import { auth } from "./index";

export const getCurrentUser = async () => {
  const session = await auth();

  return session?.user ?? null;
};