import { config } from "dotenv";
import { eq } from "drizzle-orm";

import { users } from "~/server/db/schema";

const nodeEnv = process.env.NODE_ENV ?? "development";
const envFiles = [
  `.env.${nodeEnv}.local`,
  nodeEnv !== "test" ? ".env.local" : null,
  `.env.${nodeEnv}`,
  ".env",
].filter((file): file is string => Boolean(file));

for (const path of envFiles) {
  config({ path, override: false, quiet: true });
}

async function promoteAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error("Usage: pnpm db:promote-admin <email>");
  }

  const { db } = await import("~/server/db");

  const [updatedUser] = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, email))
    .returning({ id: users.id, email: users.email, role: users.role });

  if (!updatedUser) {
    throw new Error(`User with email "${email}" was not found`);
  }

  console.log(
    `Promoted user ${updatedUser.email ?? updatedUser.id} to ${updatedUser.role}`,
  );
}

promoteAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Promote admin: ERROR", error);
    process.exit(1);
  });
