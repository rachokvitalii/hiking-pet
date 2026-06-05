import type { InferSelectModel } from "drizzle-orm";
import type { userProfile } from "~/server/db/schema";

import type { ExperienceLevel, TripDuration } from "~/types/types";
import { EXPERIENCE_LEVELS, TRIP_DURATIONS } from "~/types/types";
import type { Season, RankedRoute, Route } from "~/features/routes/types";
import {
  getWeatherForecastForLLM,
  type WeatherForecastDay,
} from "~/server/services/weather/open-meteo";

type UserProfileRow = InferSelectModel<typeof userProfile>;

type RankRoutesInput = {
  routes: Route[];
  profile: UserProfileRow | null;
  limit?: number;
  now?: Date;
};

const difficultyRank: Record<ExperienceLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export async function rankRoutesForRecommendation({
  routes: routeRows,
  profile,
  limit = 3,
  now = new Date(),
}: RankRoutesInput): Promise<RankedRoute[]> {
  const currentSeason = getSeason(now);
  const forecasts = await fetchWeatherByRouteId(routeRows);

  return routeRows
    .map((route) => {
      const weather = forecasts.get(route.id) ?? null;
      const ranked = scoreRoute({
        route,
        profile,
        currentSeason,
        weatherDays: weather?.forecastDays ?? null,
      });

      return {
        route,
        score: ranked.score,
        reason: ranked.reason,
        weatherContext: weather?.llmContext ?? null,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.route.days !== right.route.days) {
        return left.route.days - right.route.days;
      }

      return left.route.distanceKm - right.route.distanceKm;
    })
    .slice(0, limit);
}

async function fetchWeatherByRouteId(routes: Route[]) {
  const forecasts = await Promise.allSettled(
    routes.map(async (route) => {
      const forecast = await getWeatherForecastForLLM({
        latitude: route.latitude,
        longitude: route.longitude,
        days: route.days,
      });

      return [route.id, forecast] as const;
    }),
  );

  return new Map(
    forecasts
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value),
  );
}

function scoreRoute({
  route,
  profile,
  currentSeason,
  weatherDays,
}: {
  route: Route;
  profile: UserProfileRow | null;
  currentSeason: Season;
  weatherDays: WeatherForecastDay[] | null;
}) {
  const reasons: string[] = [];
  let score = 50;

  const profileExperienceLevel = parseExperienceLevel(profile?.experienceLevel);
  const difficultyScore = scoreDifficulty(
    route.difficulty,
    profileExperienceLevel,
  );
  score += difficultyScore.score;
  reasons.push(difficultyScore.reason);

  const preferredTripDuration = parseTripDuration(
    profile?.preferredTripDuration,
  );
  const durationScore = scoreDuration(route.days, preferredTripDuration);
  score += durationScore.score;
  reasons.push(durationScore.reason);

  const dailyDistanceScore = scoreDailyDistance(
    route.distanceKm,
    route.days,
    profile?.maxDailyKm ?? null,
  );
  score += dailyDistanceScore.score;
  reasons.push(dailyDistanceScore.reason);

  const seasonScore = scoreSeason(route.seasons, currentSeason);
  score += seasonScore.score;

  const weatherScore = scoreWeather(weatherDays, route.days);
  score += weatherScore.score;
  reasons.push(weatherScore.reason);

  return {
    score: clampScore(score),
    reason: reasons.join(" "),
  };
}

function scoreDifficulty(
  routeDifficulty: ExperienceLevel,
  profileExperienceLevel: ExperienceLevel | null,
) {
  if (!profileExperienceLevel) {
    return {
      score: 0,
      reason: "Рівень досвіду не заданий.",
    };
  }

  const difference =
    difficultyRank[routeDifficulty] - difficultyRank[profileExperienceLevel];

  if (difference === 0) {
    return {
      score: 24,
      reason: "Складність точно відповідає досвіду користувача.",
    };
  }

  if (difference < 0) {
    return {
      score: difference === -1 ? 10 : 4,
      reason: "Маршрут простіший за рівень користувача.",
    };
  }

  return {
    score: difference === 1 ? -18 : -35,
    reason: "Маршрут складніший за рівень користувача.",
  };
}

function scoreDuration(
  days: number,
  preferredTripDuration: TripDuration | null,
) {
  if (!preferredTripDuration) {
    return {
      score: 0,
      reason: "Бажана тривалість не задана.",
    };
  }

  if (preferredTripDuration === "one_day") {
    return days === 1
      ? { score: 18, reason: "Одноденний маршрут відповідає профілю." }
      : { score: -18, reason: "Маршрут довший за бажаний формат." };
  }

  return days > 1
    ? { score: 18, reason: "Багатоденний маршрут відповідає профілю." }
    : { score: 4, reason: "Маршрут коротший за бажаний формат." };
}

function scoreDailyDistance(
  distanceKm: number,
  days: number,
  maxDailyKm: number | null,
) {
  if (!maxDailyKm) {
    return {
      score: 0,
      reason: "Максимальна денна дистанція не задана.",
    };
  }

  const dailyDistanceKm = distanceKm / days;

  if (dailyDistanceKm <= maxDailyKm) {
    return {
      score: 18,
      reason: `Денна дистанція близько ${Math.round(dailyDistanceKm)} км вкладається в ліміт.`,
    };
  }

  if (dailyDistanceKm <= maxDailyKm * 1.2) {
    return {
      score: 6,
      reason: `Денна дистанція близько ${Math.round(dailyDistanceKm)} км трохи вища за ліміт.`,
    };
  }

  return {
    score: -24,
    reason: `Денна дистанція близько ${Math.round(dailyDistanceKm)} км перевищує ліміт.`,
  };
}

function scoreSeason(routeSeasons: Season[], currentSeason: Season) {
  if (routeSeasons.includes(currentSeason)) {
    return {
      score: 14,
      reason: `Маршрут підходить для сезону ${currentSeason}.`,
    };
  }

  return {
    score: -16,
    reason: `Маршрут не позначений як сезонний для ${currentSeason}.`,
  };
}

function scoreWeather(
  weatherDays: WeatherForecastDay[] | null,
  routeDays: number,
) {
  if (!weatherDays) {
    return {
      score: 0,
      reason: "Прогноз погоди недоступний, weather-score нейтральний.",
    };
  }

  const relevantDays = weatherDays.slice(0, routeDays);
  const worstDay = relevantDays.reduce(
    (worst, day) => {
      const risk = getWeatherRisk(day);
      return risk.penalty < worst.penalty ? risk : worst;
    },
    { penalty: 0, reason: "Погода без явних ризиків." },
  );

  if (worstDay.penalty === 0) {
    return {
      score: 12,
      reason: "Прогноз погоди сприятливий для маршруту.",
    };
  }

  return {
    score: worstDay.penalty,
    reason: worstDay.reason,
  };
}

function getWeatherRisk(day: WeatherForecastDay) {
  if (day.condition.toLowerCase().includes("thunderstorm")) {
    return {
      penalty: -40,
      reason: `На ${day.date} можливі грози, маршрут має високий погодний ризик.`,
    };
  }

  if (day.windGustsMaxKmh >= 70) {
    return {
      penalty: -34,
      reason: `На ${day.date} пориви вітру до ${day.windGustsMaxKmh} км/год.`,
    };
  }

  if (
    day.precipitationMm >= 20 ||
    (day.precipitationProbabilityPct !== null &&
      day.precipitationProbabilityPct >= 80)
  ) {
    return {
      penalty: -26,
      reason: `На ${day.date} високий ризик опадів.`,
    };
  }

  if (day.windGustsMaxKmh >= 50 || day.windSpeedMaxKmh >= 40) {
    return {
      penalty: -14,
      reason: `На ${day.date} прогнозується сильний вітер.`,
    };
  }

  if (day.apparentTemperatureMinC <= -10) {
    return {
      penalty: -16,
      reason: `На ${day.date} відчутна температура може бути нижче -10C.`,
    };
  }

  if (day.apparentTemperatureMaxC >= 32) {
    return {
      penalty: -12,
      reason: `На ${day.date} можлива спека вище 32C за відчуттям.`,
    };
  }

  return { penalty: 0, reason: "Погода без явних ризиків." };
}

function getSeason(date: Date): Season {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";

  return "winter";
}

function parseExperienceLevel(value: string | null | undefined) {
  if (!value) return null;

  return EXPERIENCE_LEVELS.includes(value as ExperienceLevel)
    ? (value as ExperienceLevel)
    : null;
}

function parseTripDuration(value: string | null | undefined) {
  if (!value) return null;

  return TRIP_DURATIONS.includes(value as TripDuration)
    ? (value as TripDuration)
    : null;
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
