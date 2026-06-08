import { routeWeatherTool } from "./route-weather";

export function createAssistantTools({ userId }: { userId: number }) {
  return {
    routeWeatherTool,
  }
}