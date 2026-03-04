import { relations } from "drizzle-orm";
import { users } from "./users-schema";
import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const packingList = pgTable(
  "packing_list",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 128 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("packing_list_user_idx").on(t.userId)]
);

export const packingCategory = pgTable(
  "packing_category",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 32 }).notNull(), // "hiking" | "camping" | ...
    key: varchar("key", { length: 64 }).notNull(), // "sleep", "cooking" ...
    title: varchar("title", { length: 128 }).notNull(), // "Sleep", "Cooking"
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("packing_category_type_idx").on(t.type),
    uniqueIndex("packing_category_type_key_unique").on(t.type, t.key),
  ]
);

export const packingCatalogItem = pgTable(
  "packing_catalog_item",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => packingCategory.id, { onDelete: "cascade" }),

    key: varchar("key", { length: 96 }), // optional stable key, e.g. "sleeping_bag"
    label: varchar("label", { length: 256 }).notNull(), // "Sleeping bag"
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("packing_catalog_item_category_idx").on(t.categoryId),
    uniqueIndex("packing_catalog_item_category_key_unique").on(
      t.categoryId,
      t.key,
    ),
  ],
);

export const packingListItem = pgTable(
  "packing_list_item",
  {
    id: serial("id").primaryKey(),
    listId: integer("list_id")
      .notNull()
      .references(() => packingList.id, { onDelete: "cascade" }),

    // якщо item з каталогу — зберігаємо catalogItemId
    // якщо custom — тоді catalogItemId = null і заповнюємо label/categoryKey
    catalogItemId: integer("catalog_item_id").references(() => packingCatalogItem.id, {
      onDelete: "set null",
    }),

    categoryKey: varchar("category_key", { length: 64 }), // "sleep", "cooking" (для custom або денормалізація)
    label: varchar("label", { length: 256 }).notNull(), // завжди зручно мати label прямо тут

    checked: boolean("checked").notNull().default(false),
    source: varchar("source", { length: 16 }).notNull(), // "catalog" | "custom"

    sortOrder: integer("sort_order").notNull().default(0),

    // optional поля (можеш видалити, якщо не треба)
    notes: text("notes"),
    quantity: integer("quantity"),
    weightGrams: integer("weight_grams"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
      index("packing_list_item_list_idx").on(t.listId),
      uniqueIndex("packing_list_item_list_catalog_unique").on(t.listId, t.catalogItemId),
    ]
);

// relations
export const packingListRelations = relations(packingList, ({ one, many }) => ({
  user: one(users, {
    fields: [packingList.userId],
    references: [users.id],
  }),
  items: many(packingListItem),
}));

export const packingListItemRelations = relations(packingListItem, ({ one }) => ({
  list: one(packingList, {
    fields: [packingListItem.listId],
    references: [packingList.id],
  }),
  catalogItem: one(packingCatalogItem, {
    fields: [packingListItem.catalogItemId],
    references: [packingCatalogItem.id],
  }),
}));

export const packingCategoryRelations = relations(packingCategory, ({ many }) => ({
  catalogItems: many(packingCatalogItem),
}));

export const packingCatalogItemRelations = relations(packingCatalogItem, ({ one, many }) => ({
  category: one(packingCategory, {
    fields: [packingCatalogItem.categoryId],
    references: [packingCategory.id],
  }),
  listItems: many(packingListItem),
}));