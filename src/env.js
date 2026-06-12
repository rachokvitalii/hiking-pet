// Duplicate of env.ts — next.config.js runs in Node and cannot import .ts files.
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_URL: z.string().url().optional(),
    DATABASE_URL: z.string().url(),
    PROD_DATABASE_URL: z.string().url().optional(),
    DRIZZLE_ENV: z.enum(["development", "production"]).default("development"),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
    OPENAI_RECOMMENDATION_MODEL: z.string().default("gpt-5-mini"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {},
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    PROD_DATABASE_URL: process.env.PROD_DATABASE_URL,
    DRIZZLE_ENV: process.env.DRIZZLE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
    OPENAI_RECOMMENDATION_MODEL: process.env.OPENAI_RECOMMENDATION_MODEL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
