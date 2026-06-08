import { tool } from "ai"
import { z } from "zod"
import { db } from "~/server/db"
import { routes } from "~/server/db/routes-schema"
import { eq } from "drizzle-orm"
import { getWeatherForecastForLLM } from "../../weather/open-meteo"

export const routeWeatherTool = tool({
    description: "Get the weather for a given route",
    inputSchema: z.object({
      routeId: z.number().int().positive().describe("The ID of the route to get the weather for"),
    }),
    execute: async ({ routeId }) => {
      const [route] = await db.select().from(routes).where(eq(routes.id, routeId))

      if (!route) {
        return {
          ok: false,
          error: "Route not found",
          route: null,
          forecast: null,
        }
      }

      try {
        const weather = await getWeatherForecastForLLM({
          latitude: route.latitude,
          longitude: route.longitude,
          days: route.days,
        })

        return {
          ok: true,
          error: null,
          route: {
            id: route.id,
            title: route.title,
            region: route.region,
            days: route.days,
          },
          forecast: weather,
        }
      } catch {
        return {
          ok: false,
          error: "Weather forecast is currently unavailable",
          route: {
            id: route.id,
            title: route.title,
            region: route.region,
            days: route.days,
          },
          forecast: null,
        }
      }
    }
  })
