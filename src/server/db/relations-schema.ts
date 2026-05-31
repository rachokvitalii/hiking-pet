import { relations } from "drizzle-orm";

import { userProfile } from "./users-schema";
import { users } from "./users-schema";
import {
  gearCatalogItems,
  gearCategories,
  packingListItems,
  packingLists,
} from "./packing-schema";
import { routeRecommendations, routeRecommendationItems, routes } from "./routes-schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfile, {
    fields: [users.id],
    references: [userProfile.userId],
  }),
  routeRecommendations: many(routeRecommendations),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(users, {
    fields: [userProfile.userId],
    references: [users.id],
  }),
}));

// packing lists relations

export const packingListsRelations = relations(
  packingLists,
  ({ one, many }) => ({
    user: one(users, {
      fields: [packingLists.userId],
      references: [users.id],
    }),

    items: many(packingListItems),
  }),
);

export const gearCategoriesRelations = relations(
  gearCategories,
  ({ many }) => ({
    catalogItems: many(gearCatalogItems),
    packingListItems: many(packingListItems),
  }),
);

export const gearCatalogItemsRelations = relations(
  gearCatalogItems,
  ({ one, many }) => ({
    category: one(gearCategories, {
      fields: [gearCatalogItems.categoryId],
      references: [gearCategories.id],
    }),

    packingListItems: many(packingListItems),
  }),
);

export const packingListItemsRelations = relations(
  packingListItems,
  ({ one }) => ({
    packingList: one(packingLists, {
      fields: [packingListItems.packingListId],
      references: [packingLists.id],
    }),

    category: one(gearCategories, {
      fields: [packingListItems.categoryId],
      references: [gearCategories.id],
    }),

    catalogItem: one(gearCatalogItems, {
      fields: [packingListItems.catalogItemId],
      references: [gearCatalogItems.id],
    }),
  }),
);

// routes relations

export const routesRelations = relations(routes, ({ many }) => ({
  recommendationItems: many(routeRecommendationItems),
}));

export const routeRecommendationsRelations = relations(
  routeRecommendations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [routeRecommendations.userId],
      references: [users.id],
    }),
    items: many(routeRecommendationItems),
  }),
);

export const routeRecommendationItemsRelations = relations(
  routeRecommendationItems,
  ({ one }) => ({
    recommendation: one(routeRecommendations, {
      fields: [routeRecommendationItems.recommendationId],
      references: [routeRecommendations.id],
    }),
    route: one(routes, {
      fields: [routeRecommendationItems.routeId],
      references: [routes.id],
    }),
  }),
);
