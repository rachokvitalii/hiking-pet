import { config } from "dotenv";
import { inArray } from "drizzle-orm";

import {
  gearCatalogItems,
  gearCategories,
  type gearCategoryEnum,
} from "~/server/db/schema";

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

type GearCategory = (typeof gearCategoryEnum.enumValues)[number];

type CategorySeed = {
  key: GearCategory;
  sortOrder: number;
};

type CatalogItemSeed = {
  categoryKey: GearCategory;
  key: string;
  sortOrder: number;
};

const categoriesSeed: CategorySeed[] = [
  { key: "bivouac", sortOrder: 10 },
  { key: "kitchen", sortOrder: 20 },
  { key: "hygiene", sortOrder: 30 },
  { key: "gear", sortOrder: 40 },
  { key: "navigation", sortOrder: 50 },
  { key: "electronics", sortOrder: 60 },
  { key: "documents_money", sortOrder: 70 },
  { key: "other", sortOrder: 80 },
  { key: "clothing_footwear", sortOrder: 90 },
  { key: "first_aid", sortOrder: 100 },
  { key: "food", sortOrder: 110 },
];

const catalogItemsSeed: CatalogItemSeed[] = [
  { categoryKey: "bivouac", key: "tent", sortOrder: 10 },
  { categoryKey: "bivouac", key: "footprint", sortOrder: 20 },
  { categoryKey: "bivouac", key: "sleeping_bag", sortOrder: 30 },
  { categoryKey: "bivouac", key: "sleeping_pad", sortOrder: 40 },
  { categoryKey: "bivouac", key: "sleeping_pad_pump", sortOrder: 50 },
  { categoryKey: "bivouac", key: "sleeping_pad_repair_kit", sortOrder: 60 },

  { categoryKey: "kitchen", key: "fire_source", sortOrder: 10 },
  { categoryKey: "kitchen", key: "backup_fire_source", sortOrder: 20 },
  { categoryKey: "kitchen", key: "spoon", sortOrder: 30 },
  { categoryKey: "kitchen", key: "plate", sortOrder: 40 },
  { categoryKey: "kitchen", key: "mug", sortOrder: 50 },
  { categoryKey: "kitchen", key: "knife", sortOrder: 60 },
  { categoryKey: "kitchen", key: "water_containers", sortOrder: 70 },
  { categoryKey: "kitchen", key: "water_filter", sortOrder: 80 },
  { categoryKey: "kitchen", key: "integrated_stove_system", sortOrder: 90 },
  { categoryKey: "kitchen", key: "gas_canister", sortOrder: 100 },

  { categoryKey: "hygiene", key: "toiletry_bag", sortOrder: 10 },
  { categoryKey: "hygiene", key: "towel", sortOrder: 20 },
  { categoryKey: "hygiene", key: "sunscreen", sortOrder: 30 },
  { categoryKey: "hygiene", key: "lip_sunscreen", sortOrder: 40 },
  { categoryKey: "hygiene", key: "moisturizer", sortOrder: 50 },
  { categoryKey: "hygiene", key: "toothpaste", sortOrder: 60 },
  { categoryKey: "hygiene", key: "toothbrush", sortOrder: 70 },
  { categoryKey: "hygiene", key: "toilet_trowel", sortOrder: 80 },
  { categoryKey: "hygiene", key: "toilet_paper", sortOrder: 90 },
  { categoryKey: "hygiene", key: "soap", sortOrder: 100 },
  { categoryKey: "hygiene", key: "mini_scissors", sortOrder: 110 },
  { categoryKey: "hygiene", key: "mirror", sortOrder: 120 },

  { categoryKey: "gear", key: "backpack", sortOrder: 10 },
  { categoryKey: "gear", key: "rain_cover", sortOrder: 20 },
  { categoryKey: "gear", key: "trekking_poles", sortOrder: 30 },
  { categoryKey: "gear", key: "flashlight", sortOrder: 40 },
  { categoryKey: "gear", key: "dry_bags", sortOrder: 50 },
  { categoryKey: "gear", key: "sunglasses", sortOrder: 60 },
  { categoryKey: "gear", key: "mosquito_net", sortOrder: 70 },

  { categoryKey: "navigation", key: "maps_app", sortOrder: 10 },
  { categoryKey: "navigation", key: "offline_maps", sortOrder: 20 },
  { categoryKey: "navigation", key: "laminated_map", sortOrder: 30 },
  { categoryKey: "navigation", key: "compass", sortOrder: 40 },

  { categoryKey: "electronics", key: "phone", sortOrder: 10 },
  { categoryKey: "electronics", key: "power_bank", sortOrder: 20 },
  { categoryKey: "electronics", key: "cables", sortOrder: 30 },
  { categoryKey: "electronics", key: "electronics_dry_bag", sortOrder: 40 },
  { categoryKey: "electronics", key: "camera", sortOrder: 50 },
  { categoryKey: "electronics", key: "memory_cards", sortOrder: 60 },

  { categoryKey: "documents_money", key: "passport", sortOrder: 10 },
  { categoryKey: "documents_money", key: "cash", sortOrder: 20 },
  { categoryKey: "documents_money", key: "bank_card", sortOrder: 30 },
  { categoryKey: "documents_money", key: "border_guard_permit", sortOrder: 40 },
  { categoryKey: "documents_money", key: "waterproof_case", sortOrder: 50 },

  { categoryKey: "other", key: "repair_kit", sortOrder: 10 },
  { categoryKey: "other", key: "trash_bag", sortOrder: 20 },
  { categoryKey: "other", key: "sit_pad", sortOrder: 30 },
  { categoryKey: "other", key: "mini_hammock", sortOrder: 40 },

  { categoryKey: "clothing_footwear", key: "trekking_socks", sortOrder: 10 },
  { categoryKey: "clothing_footwear", key: "trekking_tshirt", sortOrder: 20 },
  { categoryKey: "clothing_footwear", key: "trekking_pants", sortOrder: 30 },
  { categoryKey: "clothing_footwear", key: "shorts", sortOrder: 40 },
  { categoryKey: "clothing_footwear", key: "fleece_jacket", sortOrder: 50 },
  { categoryKey: "clothing_footwear", key: "fleece_pants", sortOrder: 60 },
  { categoryKey: "clothing_footwear", key: "down_jacket", sortOrder: 70 },
  { categoryKey: "clothing_footwear", key: "windbreaker", sortOrder: 80 },
  { categoryKey: "clothing_footwear", key: "membrane_jacket", sortOrder: 90 },
  { categoryKey: "clothing_footwear", key: "buff", sortOrder: 100 },
  { categoryKey: "clothing_footwear", key: "sun_hat", sortOrder: 110 },
  { categoryKey: "clothing_footwear", key: "beanie", sortOrder: 120 },
  { categoryKey: "clothing_footwear", key: "gloves", sortOrder: 130 },
  { categoryKey: "clothing_footwear", key: "footwear", sortOrder: 140 },
  { categoryKey: "clothing_footwear", key: "camp_shoes", sortOrder: 150 },

  { categoryKey: "first_aid", key: "fever_reducer", sortOrder: 10 },
  { categoryKey: "first_aid", key: "painkiller", sortOrder: 20 },
  { categoryKey: "first_aid", key: "adhesive_bandages", sortOrder: 30 },

  { categoryKey: "food", key: "tea", sortOrder: 10 },
  { categoryKey: "food", key: "coffee", sortOrder: 20 },
  { categoryKey: "food", key: "spices", sortOrder: 30 },
  { categoryKey: "food", key: "bars", sortOrder: 40 },
  { categoryKey: "food", key: "freeze_dried_food", sortOrder: 50 },
];

async function seedGearCategories() {
  const { db } = await import("~/server/db");

  await db.insert(gearCategories).values(categoriesSeed).onConflictDoNothing();
}

async function seedGearCatalogItems() {
  const { db } = await import("~/server/db");
  const categoryKeys = Array.from(new Set(catalogItemsSeed.map((item) => item.categoryKey)));
  const categoryRows = await db
    .select({
      id: gearCategories.id,
      key: gearCategories.key,
    })
    .from(gearCategories)
    .where(inArray(gearCategories.key, categoryKeys));
  const categoryIdByKey = new Map(categoryRows.map((category) => [category.key, category.id]));

  const values = catalogItemsSeed.map((item) => {
    const categoryId = categoryIdByKey.get(item.categoryKey);

    if (!categoryId) {
      throw new Error(`Gear category not found for catalog item: ${item.categoryKey}/${item.key}`);
    }

    return {
      categoryId,
      key: item.key,
      sortOrder: item.sortOrder,
      isDefault: true,
    };
  });

  const existingItems = await db
    .select({
      categoryId: gearCatalogItems.categoryId,
      key: gearCatalogItems.key,
    })
    .from(gearCatalogItems)
    .where(inArray(gearCatalogItems.categoryId, categoryRows.map((category) => category.id)));
  const existingItemKeys = new Set(
    existingItems.map((item) => `${item.categoryId}:${item.key}`)
  );
  const newValues = values.filter(
    (item) => !existingItemKeys.has(`${item.categoryId}:${item.key}`)
  );

  if (newValues.length > 0) {
    await db.insert(gearCatalogItems).values(newValues).onConflictDoNothing();
  }
}

async function main() {
  await seedGearCategories();
  await seedGearCatalogItems();
  console.log("Packing catalog seed: OK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Packing catalog seed: ERROR", error);
    process.exit(1);
  });
