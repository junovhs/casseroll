// @ts-ignore
import { ingredients as RAW_INGREDIENTS } from "../data/foods";
import {
  CATEGORIES,
  FLAVOR_PROFILES,
  FUN_NAMES,
  CHAOS_PREFIXES,
  CategoryKey,
  ProfileKey,
} from "../data/config";

export interface Ingredient {
  id: string;
  name: string;
  tags: string[];
}

export interface Recipe {
  name: string;
  profile: ProfileKey;
  ingredients: Record<CategoryKey, Ingredient>;
}

// --- Initialization Logic ---
const INGREDIENTS = (() => {
  const processed: Record<string, Ingredient[]> = {};
  for (const cat of CATEGORIES) {
    // @ts-ignore
    const rawList = RAW_INGREDIENTS[cat] || [];
    // @ts-ignore
    processed[cat] = rawList.map((item, idx) => ({
      id: `${cat}-${idx}`,
      name: item.name,
      tags: item.tags || [],
    }));
  }
  return processed;
})();

const randomInt = (max: number) => Math.floor(Math.random() * max);
const getRandomItem = <T>(arr: T[]): T => arr[randomInt(arr.length)];

const getPool = (
  category: CategoryKey,
  profile: ProfileKey,
  isChaos: boolean,
): Ingredient[] => {
  const all = INGREDIENTS[category] || [];
  if (isChaos || profile === "chaos") return all;

  const matched = all.filter((item) => item.tags.includes(profile));
  return matched.length > 0 ? matched : all;
};

const pickItem = (pool: Ingredient[], excludeId?: string): Ingredient => {
  if (!pool || pool.length === 0) return { id: "err", name: "Empty", tags: [] };
  if (pool.length === 1) return pool[0];

  let item = getRandomItem(pool);
  let attempts = 0;
  while (excludeId && item.id === excludeId && attempts < 10) {
    item = getRandomItem(pool);
    attempts++;
  }
  return item;
};

// --- Public API ---

export function generateCasserole({
  forcedProfile,
  chaosMode,
}: { forcedProfile?: ProfileKey; chaosMode?: boolean } = {}): Recipe {
  const profileKeys = Object.keys(FLAVOR_PROFILES) as ProfileKey[];
  const profile = chaosMode
    ? "chaos"
    : forcedProfile || getRandomItem(profileKeys);

  const namePool = chaosMode
    ? CHAOS_PREFIXES
    : FUN_NAMES[profile] || FUN_NAMES.comfort;

  const recipe: Recipe = {
    name: `${getRandomItem(namePool)} Casserole`,
    profile,
    ingredients: {} as Record<CategoryKey, Ingredient>,
  };

  CATEGORIES.forEach((cat) => {
    const pool = getPool(cat, profile, !!chaosMode);
    recipe.ingredients[cat] = pickItem(pool);
  });

  return recipe;
}

export function rerollIngredient(
  currentRecipe: Recipe,
  category: CategoryKey,
  chaosMode: boolean = false,
): Recipe {
  const currentId = currentRecipe.ingredients[category]?.id;
  const pool = getPool(category, currentRecipe.profile, chaosMode);
  const newItem = pickItem(pool, currentId);

  return {
    ...currentRecipe,
    ingredients: {
      ...currentRecipe.ingredients,
      [category]: newItem,
    },
  };
}

export function getCategoryStats(
  category: CategoryKey,
  profile: ProfileKey,
  chaosMode: boolean,
) {
  const pool = getPool(category, profile, chaosMode);
  return { count: pool.length };
}

// Expose pool getter for UI ingredient selection
export function getPoolForCategory(
  category: CategoryKey,
  profile: ProfileKey,
  chaosMode: boolean,
): Ingredient[] {
  return getPool(category, profile, chaosMode);
}
