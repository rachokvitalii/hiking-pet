import type { ExperienceLevel, Season, TripType } from "~/types/types";

type RouteSeed = {
  slug: string;
  title: string;
  region: string;
  type: TripType[];
  difficulty: ExperienceLevel;
  distanceKm: number;
  days: number;
  elevationGain: number;
  seasons: Season[];
  description: string;
};

export const routes: RouteSeed[] = [
  {
    slug: "hoverla-classic",
    title: "Класичний маршрут на Говерлу",
    region: "Carpathians",
    type: ["hiking"],
    difficulty: "beginner",
    distanceKm: 14,
    days: 1,
    elevationGain: 1200,
    seasons: ["spring", "summer", "autumn"],
    description: "Класичний одноденний похід на найвищу вершину України.",
  },
  {
    slug: "pip-ivan-loop",
    title: "Кільцевий маршрут на Піп Іван",
    region: "Carpathians",
    type: ["hiking", "camping"],
    difficulty: "intermediate",
    distanceKm: 32,
    days: 2,
    elevationGain: 1800,
    seasons: ["summer", "autumn"],
    description: "Дводенний похід хребтом із ночівлею біля гори Піп Іван.",
  },
  {
    slug: "synevyr-lakeside",
    title: "Стежка навколо озера Синевир",
    region: "Zakarpattia",
    type: ["hiking"],
    difficulty: "beginner",
    distanceKm: 8,
    days: 1,
    elevationGain: 300,
    seasons: ["spring", "summer", "autumn"],
    description:
      "Легка мальовнича прогулянка навколо озера Синевир та прилеглого лісу.",
  },
  {
    slug: "gorgany-wild-camp",
    title: "Дикий похід через Горгани",
    region: "Carpathians",
    type: ["hiking", "camping"],
    difficulty: "advanced",
    distanceKm: 58,
    days: 3,
    elevationGain: 3200,
    seasons: ["summer"],
    description:
      "Віддалений багатоденний маршрут через кам'янисті хребти Горган.",
  },
  {
    slug: "bakota-canyon-walk",
    title: "Прогулянка каньйоном Бакота",
    region: "Khmelnytskyi",
    type: ["hiking"],
    difficulty: "beginner",
    distanceKm: 10,
    days: 1,
    elevationGain: 250,
    seasons: ["spring", "summer", "autumn"],
    description:
      "Спокійний маршрут із панорамними краєвидами на каньйон та річку.",
  },
  {
    slug: "svydovets-ridge",
    title: "Пригода на Свидовецькому хребті",
    region: "Carpathians",
    type: ["hiking", "camping"],
    difficulty: "intermediate",
    distanceKm: 42,
    days: 3,
    elevationGain: 2100,
    seasons: ["summer", "autumn"],
    description:
      "Триденний маршрут альпійськими хребтами та гірськими озерами.",
  },
  {
    slug: "kyiv-forest-bike",
    title: "Лісовий веломаршрут біля Києва",
    region: "Kyiv",
    type: ["bike_ride"],
    difficulty: "beginner",
    distanceKm: 24,
    days: 1,
    elevationGain: 180,
    seasons: ["spring", "summer", "autumn"],
    description:
      "Простий велосипедний маршрут лісовими дорогами поблизу Києва.",
  },
  {
    slug: "dnister-bike-camp",
    title: "Байкпакінг Дністровським каньйоном",
    region: "Ternopil",
    type: ["bike_ride", "camping"],
    difficulty: "intermediate",
    distanceKm: 85,
    days: 2,
    elevationGain: 950,
    seasons: ["summer", "autumn"],
    description: "Велоподорож із ночівлею в наметі вздовж берегів Дністра.",
  },
  {
    slug: "chornohora-skyline",
    title: "Перехід Чорногірським хребтом",
    region: "Carpathians",
    type: ["hiking", "camping"],
    difficulty: "advanced",
    distanceKm: 74,
    days: 4,
    elevationGain: 4100,
    seasons: ["summer"],
    description: "Тривалий високогірний маршрут уздовж Чорногірського хребта.",
  },
  {
    slug: "lviv-weekend-hike",
    title: "Похід вихідного дня біля Львова",
    region: "Lviv",
    type: ["hiking"],
    difficulty: "beginner",
    distanceKm: 12,
    days: 1,
    elevationGain: 350,
    seasons: ["spring", "summer", "autumn"],
    description: "Короткий маршрут для початківців неподалік Львова.",
  },
];
