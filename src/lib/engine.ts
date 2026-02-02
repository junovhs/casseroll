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

// Updated Recipe type - ingredients is now an array per category
export interface Recipe {
  name: string;
  profile: ProfileKey;
  ingredients: Record<CategoryKey, Ingredient[]>;
}

// --- Initialization Logic ---
const INGREDIENTS: Record<string, Ingredient[]> = (() => {
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

// Get pool of ingredients for a category, optionally filtered by profile
export const getPool = (
  category: CategoryKey,
  profile: ProfileKey,
  isChaos: boolean,
): Ingredient[] => {
  const all = INGREDIENTS[category] || [];
  if (isChaos || profile === "chaos") return all;

  const matched = all.filter((item) => item.tags.includes(profile));
  return matched.length > 0 ? matched : all;
};

// Get ALL ingredients for a category (for manual selection)
export const getAllIngredients = (category: CategoryKey): Ingredient[] => {
  return INGREDIENTS[category] || [];
};

const pickItem = (
  pool: Ingredient[],
  excludeIds: string[] = [],
): Ingredient => {
  if (!pool || pool.length === 0) return { id: "err", name: "Empty", tags: [] };

  const available = pool.filter((item) => !excludeIds.includes(item.id));
  if (available.length === 0) return pool[0]; // fallback if all excluded

  return getRandomItem(available);
};

// --- Name Generation ---
export function generateName(profile: ProfileKey, chaosMode: boolean): string {
  const namePool =
    chaosMode || profile === "chaos"
      ? CHAOS_PREFIXES
      : FUN_NAMES[profile] || FUN_NAMES.comfort;
  return `${getRandomItem(namePool)} Casserole`;
}

// --- Public API ---

export function generateCasserole({
  forcedProfile,
  chaosMode,
  lockedProfile,
  lockedIngredients,
}: {
  forcedProfile?: ProfileKey;
  chaosMode?: boolean;
  lockedProfile?: ProfileKey;
  lockedIngredients?: Record<CategoryKey, Ingredient[]>;
} = {}): Recipe {
  const profileKeys = Object.keys(FLAVOR_PROFILES) as ProfileKey[];

  // Use locked profile if provided, otherwise pick randomly
  let profile: ProfileKey;
  if (lockedProfile) {
    profile = lockedProfile;
  } else if (chaosMode) {
    profile = "chaos";
  } else {
    profile = forcedProfile || getRandomItem(profileKeys);
  }

  const recipe: Recipe = {
    name: generateName(profile, !!chaosMode),
    profile,
    ingredients: {} as Record<CategoryKey, Ingredient[]>,
  };

  CATEGORIES.forEach((cat) => {
    // If this category has locked ingredients, keep them
    if (
      lockedIngredients &&
      lockedIngredients[cat] &&
      lockedIngredients[cat].length > 0
    ) {
      recipe.ingredients[cat] = [...lockedIngredients[cat]];
    } else {
      // Generate single ingredient
      const pool = getPool(cat, profile, !!chaosMode);
      recipe.ingredients[cat] = [pickItem(pool)];
    }
  });

  return recipe;
}

export function rerollIngredient(
  currentRecipe: Recipe,
  category: CategoryKey,
  index: number,
  chaosMode: boolean = false,
): Recipe {
  const currentIds = currentRecipe.ingredients[category].map((i) => i.id);
  const pool = getPool(category, currentRecipe.profile, chaosMode);
  const newItem = pickItem(pool, currentIds);

  const newIngredients = [...currentRecipe.ingredients[category]];
  newIngredients[index] = newItem;

  return {
    ...currentRecipe,
    ingredients: {
      ...currentRecipe.ingredients,
      [category]: newIngredients,
    },
  };
}

export function addIngredient(
  currentRecipe: Recipe,
  category: CategoryKey,
  chaosMode: boolean = false,
): Recipe {
  const currentIds = currentRecipe.ingredients[category].map((i) => i.id);
  const pool = getPool(category, currentRecipe.profile, chaosMode);
  const newItem = pickItem(pool, currentIds);

  return {
    ...currentRecipe,
    ingredients: {
      ...currentRecipe.ingredients,
      [category]: [...currentRecipe.ingredients[category], newItem],
    },
  };
}

export function removeIngredient(
  currentRecipe: Recipe,
  category: CategoryKey,
  index: number,
): Recipe {
  const newIngredients = currentRecipe.ingredients[category].filter(
    (_, i) => i !== index,
  );

  return {
    ...currentRecipe,
    ingredients: {
      ...currentRecipe.ingredients,
      [category]: newIngredients,
    },
  };
}

export function setIngredient(
  currentRecipe: Recipe,
  category: CategoryKey,
  index: number,
  ingredient: Ingredient,
): Recipe {
  const newIngredients = [...currentRecipe.ingredients[category]];
  newIngredients[index] = ingredient;

  return {
    ...currentRecipe,
    ingredients: {
      ...currentRecipe.ingredients,
      [category]: newIngredients,
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
