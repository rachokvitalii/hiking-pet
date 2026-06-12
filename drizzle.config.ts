import { type Config } from "drizzle-kit";

import { env } from "~/env";

function getDatabaseUrl() {
  if (env.DRIZZLE_ENV === "production") {
    if (!env.PROD_DATABASE_URL) {
      throw new Error(
        "PROD_DATABASE_URL is required when DRIZZLE_ENV=production",
      );
    }
    return env.PROD_DATABASE_URL;
  }

  return env.DATABASE_URL;
}

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
} satisfies Config;
