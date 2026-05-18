import { relations } from "drizzle-orm";

import { userProfile } from "./user-profile-schema";
import { users } from "./users-schema";

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfile, {
    fields: [users.id],
    references: [userProfile.userId],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(users, {
    fields: [userProfile.userId],
    references: [users.id],
  }),
}));
