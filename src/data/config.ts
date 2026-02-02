export const CATEGORIES = [
  "starch",
  "protein",
  "vegetables",
  "binder",
  "topper",
] as const;

export type CategoryKey = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<
  CategoryKey,
  { name: string; emoji: string }
> = {
  starch: { name: "Starch Base", emoji: "🍚" },
  protein: { name: "Protein", emoji: "🍗" },
  vegetables: { name: "Vegetables", emoji: "🥕" },
  binder: { name: "Creamy Binder", emoji: "🥣" },
  topper: { name: "Crispy Topper", emoji: "✨" },
};

export const FLAVOR_PROFILES = {
  comfort: { name: "Classic Comfort", emoji: "🏠" },
  american: { name: "American Diner", emoji: "🍔" },
  mexican: { name: "Tex-Mex", emoji: "🌮" },
  italian: { name: "Italian", emoji: "🍝" },
  asian: { name: "Asian Fusion", emoji: "🥢" },
  cajun: { name: "Cajun/Creole", emoji: "🦐" },
  bbq: { name: "BBQ", emoji: "🔥" },
  mediterranean: { name: "Mediterranean", emoji: "🫒" },
  "eastern-euro": { name: "Eastern European", emoji: "🥟" },
  breakfast: { name: "Breakfast for Dinner", emoji: "🍳" },
};

export type ProfileKey = keyof typeof FLAVOR_PROFILES | "chaos";

export const FUN_NAMES: Record<string, string[]> = {
  comfort: [
    "Grandma's",
    "Church Potluck",
    "Cozy Night",
    "Sunday Supper",
    "Hometown",
    "Farmhouse",
    "Heartwarming",
  ],
  american: [
    "All-American",
    "Diner Style",
    "Classic",
    "Blue Ribbon",
    "State Fair",
    "Main Street",
    "Roadside",
  ],
  mexican: [
    "Fiesta",
    "Southwest",
    "Cantina",
    "Border Town",
    "Abuela's",
    "Mercado",
    "Rancho",
  ],
  italian: [
    "Nonna's",
    "Tuscan",
    "Trattoria",
    "Villa",
    "Sunday Gravy",
    "Old World",
    "Sicilian",
  ],
  asian: [
    "Fusion",
    "East Meets West",
    "Pacific Rim",
    "Lucky Dragon",
    "Umami",
    "Golden Wok",
    "Silk Road",
  ],
  cajun: [
    "Bayou",
    "N'awlins",
    "Creole",
    "Swamp Queen",
    "Mardi Gras",
    "French Quarter",
    "Big Easy",
  ],
  bbq: [
    "Pitmaster",
    "Smokehouse",
    "Backyard",
    "Honky Tonk",
    "Roadhouse",
    "Low & Slow",
    "Texas Pride",
  ],
  mediterranean: [
    "Aegean",
    "Coastal",
    "Sun-Kissed",
    "Olive Grove",
    "Santorini",
    "Levantine",
    "Golden Coast",
  ],
  "eastern-euro": [
    "Babushka's",
    "Old Country",
    "Village",
    "Cozy Cottage",
    "Peasant",
    "Harvest",
    "Homestead",
  ],
  breakfast: [
    "Rise & Shine",
    "Brunch",
    "Morning Glory",
    "Sunrise",
    "Lazy Morning",
    "Early Bird",
    "Rooster",
  ],
};

export const CHAOS_PREFIXES = [
  "Mystery",
  "Chaos",
  "Wildcard",
  "Surprise",
  "YOLO",
  "Dice Roll",
  "Potluck Roulette",
  "Franken-",
  "Mad Scientist",
  "Kitchen Sink",
];
