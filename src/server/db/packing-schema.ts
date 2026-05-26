import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { users } from './users-schema'

export const packingListTypeEnum = pgEnum('packing_list_type', [
  'hiking',
  'camping',
  'bike_ride',
])

export const gearCategoryEnum = pgEnum('gear_category', [
  'bivouac',
  'kitchen',
  'hygiene',
  'gear',
  'navigation',
  'electronics',
  'documents_money',
  'other',
  'clothing_footwear',
  'first_aid',
  'food',
])

export const packingLists = pgTable(
  'packing_lists',
  {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    title: varchar('title', { length: 128 }).notNull(),

    type: packingListTypeEnum('type').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('packing_lists_user_id_idx').on(table.userId),
  ]
)

export const gearCategories = pgTable('gear_categories', {
  id: serial('id').primaryKey(),

  key: gearCategoryEnum('key').notNull().unique(),

  sortOrder: integer('sort_order').notNull(),
})

export const gearCatalogItems = pgTable(
  'gear_catalog_items',
  {
    id: serial('id').primaryKey(),

    categoryId: integer('category_id')
      .notNull()
      .references(() => gearCategories.id, { onDelete: 'cascade' }),

    key: varchar('key', { length: 128 }).notNull(),

    sortOrder: integer('sort_order').notNull(),

    isDefault: boolean('is_default').default(true).notNull(),
  },
  (table) => [
    index('gear_catalog_items_category_id_idx').on(table.categoryId),
    uniqueIndex('gear_catalog_items_category_key_unique').on(table.categoryId, table.key),
  ]
)

export const packingListItems = pgTable(
  'packing_list_items',
  {
    id: serial('id').primaryKey(),

    packingListId: integer('packing_list_id')
      .notNull()
      .references(() => packingLists.id, { onDelete: 'cascade' }),

    categoryId: integer('category_id')
      .notNull()
      .references(() => gearCategories.id, { onDelete: 'restrict' }),

    catalogItemId: integer('catalog_item_id').references(() => gearCatalogItems.id, {
      onDelete: 'set null',
    }),

    name: varchar('name', { length: 128 }).notNull(),

    isChecked: boolean('is_checked').default(false).notNull(),

    quantity: integer('quantity').default(1).notNull(),

    note: text('note'),

    sortOrder: integer('sort_order').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('packing_list_items_list_id_idx').on(table.packingListId),
    index('packing_list_items_category_id_idx').on(table.categoryId),
    uniqueIndex('packing_list_items_list_catalog_unique').on(
      table.packingListId,
      table.catalogItemId,
    ),
  ]
)
