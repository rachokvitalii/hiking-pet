// src/server/db/seed/packingCatalog.ts
import { inArray } from "drizzle-orm";

// поправ імпорти під свій проєкт:
import { db } from "~/server/db";
import { packingCategory, packingCatalogItem } from "~/server/db/packing-schema";

/**
 * Seed статичного каталогу спорядження:
 * - packing_category (type + key + title + sortOrder)
 * - packing_catalog_item (categoryId + key + label + sortOrder)
 *
 * Запуск (приклади):
 *   pnpm tsx src/server/db/seed/packingCatalog.ts
 *   npx tsx src/server/db/seed/packingCatalog.ts
 */

type CatalogType = "hiking" | "camping";

type CategorySeed = {
  type: CatalogType;
  key: string;
  title: string;
  sortOrder: number;
};

type ItemSeed = {
  type: CatalogType;
  categoryKey: string;
  key: string;
  label: string;
  sortOrder: number;
};

const categoriesSeed: CategorySeed[] = [
  // hiking
  { type: "hiking", key: "sleep", title: "Sleep", sortOrder: 10 },
  { type: "hiking", key: "clothes", title: "Clothes", sortOrder: 20 },
  { type: "hiking", key: "cooking", title: "Cooking", sortOrder: 30 },
  { type: "hiking", key: "water", title: "Water", sortOrder: 40 },
  { type: "hiking", key: "navigation", title: "Navigation", sortOrder: 50 },
  { type: "hiking", key: "safety", title: "Safety", sortOrder: 60 },

  // camping
  { type: "camping", key: "shelter", title: "Shelter", sortOrder: 10 },
  { type: "camping", key: "sleep", title: "Sleep", sortOrder: 20 },
  { type: "camping", key: "cooking", title: "Cooking", sortOrder: 30 },
  { type: "camping", key: "camp", title: "Camp items", sortOrder: 40 },
  { type: "camping", key: "safety", title: "Safety", sortOrder: 50 },
];

const itemsSeed: ItemSeed[] = [
  // hiking > sleep
  { type: "hiking", categoryKey: "sleep", key: "sleeping_bag", label: "Sleeping bag", sortOrder: 10 },
  { type: "hiking", categoryKey: "sleep", key: "sleeping_pad", label: "Sleeping pad", sortOrder: 20 },

  // hiking > clothes
  { type: "hiking", categoryKey: "clothes", key: "rain_jacket", label: "Rain jacket", sortOrder: 10 },
  { type: "hiking", categoryKey: "clothes", key: "warm_layer", label: "Warm layer", sortOrder: 20 },
  { type: "hiking", categoryKey: "clothes", key: "hat_gloves", label: "Hat & gloves", sortOrder: 30 },

  // hiking > cooking
  { type: "hiking", categoryKey: "cooking", key: "stove", label: "Stove", sortOrder: 10 },
  { type: "hiking", categoryKey: "cooking", key: "fuel", label: "Fuel", sortOrder: 20 },
  { type: "hiking", categoryKey: "cooking", key: "pot", label: "Pot / mug", sortOrder: 30 },

  // hiking > water
  { type: "hiking", categoryKey: "water", key: "bottle", label: "Water bottle", sortOrder: 10 },
  { type: "hiking", categoryKey: "water", key: "filter", label: "Water filter", sortOrder: 20 },

  // hiking > navigation
  { type: "hiking", categoryKey: "navigation", key: "map", label: "Offline map", sortOrder: 10 },
  { type: "hiking", categoryKey: "navigation", key: "powerbank", label: "Power bank", sortOrder: 20 },

  // hiking > safety
  { type: "hiking", categoryKey: "safety", key: "first_aid", label: "First aid kit", sortOrder: 10 },
  { type: "hiking", categoryKey: "safety", key: "headlamp", label: "Headlamp", sortOrder: 20 },

  // camping > shelter
  { type: "camping", categoryKey: "shelter", key: "tent", label: "Tent", sortOrder: 10 },
  { type: "camping", categoryKey: "shelter", key: "tarp", label: "Tarp (optional)", sortOrder: 20 },

  // camping > sleep
  { type: "camping", categoryKey: "sleep", key: "sleeping_bag", label: "Sleeping bag", sortOrder: 10 },
  { type: "camping", categoryKey: "sleep", key: "sleeping_pad", label: "Sleeping pad", sortOrder: 20 },

  // camping > cooking
  { type: "camping", categoryKey: "cooking", key: "stove", label: "Stove", sortOrder: 10 },
  { type: "camping", categoryKey: "cooking", key: "fuel", label: "Fuel", sortOrder: 20 },
  { type: "camping", categoryKey: "cooking", key: "cooler", label: "Cooler / food box", sortOrder: 30 },

  // camping > camp
  { type: "camping", categoryKey: "camp", key: "chair", label: "Camp chair", sortOrder: 10 },
  { type: "camping", categoryKey: "camp", key: "lamp", label: "Camp lamp", sortOrder: 20 },

  // camping > safety
  { type: "camping", categoryKey: "safety", key: "first_aid", label: "First aid kit", sortOrder: 10 },
  { type: "camping", categoryKey: "safety", key: "repellent", label: "Insect repellent", sortOrder: 20 },
];
console.log(process.env.DATABASE_URL);

async function seedCategories() {
  // Вставляємо категорії; у тебе є unique(type, key), тому дублікати ігноруємо
  await db
    .insert(packingCategory)
    .values(categoriesSeed)
    .onConflictDoNothing();
}

async function getCategoryIdMap() {
  const types = Array.from(new Set(categoriesSeed.map((c) => c.type)));
  const rows = await db
    .select({
      id: packingCategory.id,
      type: packingCategory.type,
      key: packingCategory.key,
    })
    .from(packingCategory)
    .where(inArray(packingCategory.type, types));

  // key мапи: `${type}:${categoryKey}` -> id
  const map = new Map<string, number>();
  for (const r of rows) map.set(`${r.type}:${r.key}`, r.id);
  return map;
}

async function seedItems(categoryIdMap: Map<string, number>) {
  const values = itemsSeed.map((i) => {
    const categoryId = categoryIdMap.get(`${i.type}:${i.categoryKey}`);
    if (!categoryId) {
      throw new Error(`Category not found for item: ${i.type}/${i.categoryKey} (${i.key})`);
    }
    return {
      categoryId,
      key: i.key,
      label: i.label,
      sortOrder: i.sortOrder,
    };
  });

  // У тебе є unique(categoryId, key) (key nullable, але тут не null), тому дублікати ігноруємо
  await db
    .insert(packingCatalogItem)
    .values(values)
    .onConflictDoNothing();
}

async function main() {
  await seedCategories();
  const categoryIdMap = await getCategoryIdMap();
  await seedItems(categoryIdMap);
  console.log("Packing catalog seed: OK");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Packing catalog seed: ERROR", e);
    process.exit(1);
  });