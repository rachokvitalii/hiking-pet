import { auth } from "./index";

export const getCurrentUser = async () => {
  const session = await auth();

  return session?.user ?? null;
};

export const requireAdmin = async () => {
  const user = await getCurrentUser();

  if (!user?.id || user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
};
