import { config } from "dotenv";

import { gearCategories, type gearCategoryEnum } from "~/server/db/schema";

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

async function seedGearCategories() {
  const { db } = await import("~/server/db");

  await db.insert(gearCategories).values(categoriesSeed).onConflictDoNothing();
}

async function main() {
  await seedGearCategories();
  console.log("Packing categories seed: OK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Packing categories seed: ERROR", error);
    process.exit(1);
  });
