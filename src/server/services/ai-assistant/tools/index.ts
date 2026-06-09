import { routeWeatherTool } from "./route-weather";

export function createAssistantTools({ userId: _userId }: { userId: number }) {
  return {
    routeWeatherTool,
  };
}
