import { config } from "dotenv";

import { routes as routeSeeds } from "~/data/route";
import { routes } from "~/server/db/schema";

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

const routesSeed = routeSeeds.map((route) => ({
  slug: route.slug,
  title: route.title,
  description: route.description,
  region: route.region,
  type: route.type,
  difficulty: route.difficulty,
  latitude: route.latitude,
  longitude: route.longitude,
  distanceKm: route.distanceKm,
  days: route.days,
  elevationGain: route.elevationGain,
  seasons: route.seasons,
}));

async function seedRoutes() {
  const { db } = await import("~/server/db");

  for (const route of routesSeed) {
    await db
      .insert(routes)
      .values(route)
      .onConflictDoUpdate({
        target: routes.slug,
        set: {
          title: route.title,
          description: route.description,
          region: route.region,
          type: route.type,
          difficulty: route.difficulty,
          latitude: route.latitude,
          longitude: route.longitude,
          distanceKm: route.distanceKm,
          days: route.days,
          elevationGain: route.elevationGain,
          seasons: route.seasons,
          updatedAt: new Date(),
        },
      });
  }
}

async function main() {
  await seedRoutes();
  console.log("Routes seed: OK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Routes seed: ERROR", error);
    process.exit(1);
  });
