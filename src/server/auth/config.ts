import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm"
import { compare } from "bcrypt"

import { db } from "~/server/db";
import { users } from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
      }

      return token
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string

      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, credentials.email as string))
    
          if (!user?.password) {
            return null
          }
          
          const isPasswordCorrect = await compare(credentials.password as string, user.password)
    
          if (!isPasswordCorrect) {
            return null
          }
    
          return {
            id: user.id.toString(),
            email: user.email
          }
        } catch(e) {
          throw new Error("Auth failed")
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
