import { relations } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { userProfile } from "./user-profile-schema";

export const users = pgTable("users", {
  id: serial('id').primaryKey(),
  email: text("email").unique(),
  password: text('password'),
  createAt: timestamp("created_at").defaultNow(),
  twoFactorSecret: text("2fa_secret"),
  twoFactorDeactivated: boolean("2fa_activated").default(false),
})

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfile, {
    fields: [users.id],
    references: [userProfile.userId],
  }),
}))