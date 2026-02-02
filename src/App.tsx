import { useState, useRef, useEffect } from "react";
import {
  CATEGORIES,
  FLAVOR_PROFILES,
  CategoryKey,
  ProfileKey,
  MULTI_CATEGORIES,
} from "./data/config";
import {
  generateCasserole,
  rerollIngredient,
  addIngredient,
  removeIngredient,
  setIngredient,
  getCategoryStats,
  generateName,
  Recipe,
  Ingredient,
  getPool,
} from "./lib/engine";
import IngredientRow from "./components/IngredientRow";
import {
  Dices,
  Sparkles,
  ChefHat,
  Lock,
  Unlock,
  RefreshCw,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

type LockState = Record<CategoryKey, Set<number>>;

// Helper to pick random item avoiding exclusions
const pickRandom = <T extends { id: string }>(
  pool: T[],
  excludeIds: string[],
): T => {
  const available = pool.filter((item) => !excludeIds.includes(item.id));
  if (available.length === 0) return pool[0];
  return available[Math.floor(Math.random() * available.length)];
};

export default function App() {
  const [recipe, setRecipe] = useState<Recipe>(() => generateCasserole());
  const [chaosMode, setChaosMode] = useState(false);
  const [profileLocked, setProfileLocked] = useState(false);
  const [ingredientLocks, setIngredientLocks] = useState<LockState>(() =>
    CATEGORIES.reduce(
      (acc, cat) => ({ ...acc, [cat]: new Set<number>() }),
      {} as LockState,
    ),
  );

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningCategory, setSpinningCategory] = useState<
    CategoryKey | "ALL" | null
  >(null);

  // UI state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileDropdownPos, setProfileDropdownPos] = useState({
    top: 0,
    left: 0,
  });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(recipe.name);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const currentProfile =
    FLAVOR_PROFILES[recipe.profile as keyof typeof FLAVOR_PROFILES];

  // Position profile dropdown when opened
  useEffect(() => {
    if (showProfileDropdown && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setProfileDropdownPos({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [showProfileDropdown]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown)
      document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showProfileDropdown]);

  // Focus name input when editing
  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  const handleFullRoll = () => {
    setIsSpinning(true);
    setSpinningCategory("ALL");

    setTimeout(() => {
      // Determine profile
      const profileKeys = Object.keys(FLAVOR_PROFILES) as ProfileKey[];
      let newProfile: ProfileKey;
      if (profileLocked) {
        newProfile = recipe.profile;
      } else if (chaosMode) {
        newProfile = "chaos";
      } else {
        newProfile =
          profileKeys[Math.floor(Math.random() * profileKeys.length)];
      }

      // Build new ingredients, preserving slot counts
      const newIngredients: Record<CategoryKey, Ingredient[]> = {} as any;

      CATEGORIES.forEach((cat) => {
        const currentSlots = recipe.ingredients[cat];
        const lockedIndices = ingredientLocks[cat];
        const pool = getPool(cat, newProfile, chaosMode);

        const newSlot: Ingredient[] = [];
        const usedIds: string[] = [];

        // For each slot position, either keep locked ingredient or roll new
        for (let i = 0; i < currentSlots.length; i++) {
          if (lockedIndices.has(i)) {
            // Keep locked ingredient
            newSlot.push(currentSlots[i]);
            usedIds.push(currentSlots[i].id);
          } else {
            // Roll new ingredient
            const picked = pickRandom(pool, usedIds);
            newSlot.push(picked);
            usedIds.push(picked.id);
          }
        }

        newIngredients[cat] = newSlot;
      });

      const newName =
        editingName || nameInput !== recipe.name
          ? nameInput
          : generateName(newProfile, chaosMode);

      setRecipe({
        name: newName,
        profile: newProfile,
        ingredients: newIngredients,
      });
      setNameInput(newName);
      setIsSpinning(false);
      setSpinningCategory(null);
    }, 600);
  };

  const handleReset = () => {
    const fresh = generateCasserole({ chaosMode });
    setRecipe(fresh);
    setNameInput(fresh.name);
    setIngredientLocks(
      CATEGORIES.reduce(
        (acc, cat) => ({ ...acc, [cat]: new Set<number>() }),
        {} as LockState,
      ),
    );
    setProfileLocked(false);
  };

  const handleNameReroll = () => {
    const newName = generateName(recipe.profile, chaosMode);
    setRecipe((prev) => ({ ...prev, name: newName }));
    setNameInput(newName);
    setEditingName(false);
  };

  const handleNameSubmit = () => {
    setRecipe((prev) => ({ ...prev, name: nameInput || "Casserole" }));
    setEditingName(false);
  };

  const handleProfileSelect = (profileKey: ProfileKey) => {
    setRecipe((prev) => ({ ...prev, profile: profileKey }));
    setShowProfileDropdown(false);
  };

  const handleSingleReroll = (category: CategoryKey, index: number) => {
    if (ingredientLocks[category].has(index)) return;

    setSpinningCategory(category);
    setTimeout(() => {
      setRecipe((prev) => rerollIngredient(prev, category, index, chaosMode));
      setSpinningCategory(null);
    }, 300);
  };

  const handleToggleLock = (category: CategoryKey, index: number) => {
    setIngredientLocks((prev) => {
      const newSet = new Set(prev[category]);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return { ...prev, [category]: newSet };
    });
  };

  const handleSelectIngredient = (
    category: CategoryKey,
    index: number,
    ingredient: Ingredient,
  ) => {
    setRecipe((prev) => setIngredient(prev, category, index, ingredient));
  };

  const handleAddIngredient = (category: CategoryKey) => {
    if (
      !MULTI_CATEGORIES.includes(category) ||
      recipe.ingredients[category].length >= 3
    )
      return;
    setRecipe((prev) => addIngredient(prev, category, chaosMode));
  };

  const handleRemoveIngredient = (category: CategoryKey, index: number) => {
    if (recipe.ingredients[category].length <= 1) return;

    // Update locks - shift down indices above removed
    setIngredientLocks((prev) => {
      const newSet = new Set<number>();
      prev[category].forEach((i) => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return { ...prev, [category]: newSet };
    });

    setRecipe((prev) => removeIngredient(prev, category, index));
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-slate-800 font-sans selection:bg-orange-200 flex flex-col items-center">
      <div className="w-full max-w-md px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <ChefHat className="w-10 h-10 text-amber-600" />
            <h1 className="text-5xl font-black text-amber-600 tracking-tighter transform -rotate-2 drop-shadow-sm">
              CasseROLL
            </h1>
          </div>
          <p className="text-amber-800/60 font-medium font-serif italic text-lg">
            "Roll for dinner initiative"
          </p>
        </div>

        {/* Recipe Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/10 border-4 border-white p-6 mb-6 relative transition-all">
          {/* Card Header */}
          <div
            className={`text-center mb-6 transition-all duration-300 ${
              isSpinning && spinningCategory === "ALL"
                ? "opacity-0 scale-90 blur-sm"
                : "opacity-100 scale-100"
            }`}
          >
            {/* Recipe Name - Clickable to edit */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {editingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSubmit();
                    if (e.key === "Escape") {
                      setNameInput(recipe.name);
                      setEditingName(false);
                    }
                  }}
                  className="text-2xl font-bold text-slate-800 text-center bg-amber-50 border-2 border-amber-200 rounded-lg px-3 py-1 focus:outline-none focus:border-amber-400 max-w-[280px]"
                />
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-2xl font-bold text-slate-800 leading-tight hover:text-amber-700 transition-colors"
                  title="Click to edit name"
                >
                  {recipe.name}
                </button>
              )}
              <button
                onClick={handleNameReroll}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                title="Reroll name"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Profile/Cuisine Selector */}
            <div className="flex justify-center items-center gap-2">
              {recipe.profile === "chaos" ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-purple-200">
                  <Sparkles className="w-3 h-3" /> Wild Magic
                </span>
              ) : (
                <>
                  <button
                    ref={profileButtonRef}
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200 hover:bg-amber-200 transition-colors"
                  >
                    {currentProfile?.emoji} {currentProfile?.name}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Fixed position dropdown */}
                  {showProfileDropdown && (
                    <div
                      ref={profileDropdownRef}
                      className="fixed z-[100] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[200px]"
                      style={{
                        top: profileDropdownPos.top,
                        left: profileDropdownPos.left,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {Object.entries(FLAVOR_PROFILES).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => handleProfileSelect(key as ProfileKey)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-amber-50 transition-colors flex items-center gap-2 ${
                            recipe.profile === key
                              ? "bg-amber-100 text-amber-800"
                              : "text-slate-700"
                          }`}
                        >
                          <span>{value.emoji}</span>
                          <span>{value.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Profile Lock */}
              <button
                onClick={() => setProfileLocked(!profileLocked)}
                className={`p-1.5 rounded-lg transition-colors ${
                  profileLocked
                    ? "text-amber-600 bg-amber-100"
                    : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                }`}
                title={profileLocked ? "Unlock cuisine" : "Lock cuisine"}
              >
                {profileLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Ingredient List */}
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <IngredientRow
                key={cat}
                categoryKey={cat}
                ingredients={recipe.ingredients[cat]}
                profile={recipe.profile}
                chaosMode={chaosMode}
                stats={getCategoryStats(cat, recipe.profile, chaosMode)}
                isSpinning={isSpinning || !!spinningCategory}
                isTargeted={
                  spinningCategory === cat || spinningCategory === "ALL"
                }
                lockedIndices={ingredientLocks[cat]}
                onReroll={handleSingleReroll}
                onToggleLock={handleToggleLock}
                onSelectIngredient={handleSelectIngredient}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
              />
            ))}
          </div>
        </div>

        {/* Action Area */}
        <div className="mt-auto space-y-4 pb-6">
          <button
            onClick={handleFullRoll}
            disabled={isSpinning}
            className="group relative w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-black text-xl rounded-2xl shadow-[0_6px_0_rgb(180,83,9)] hover:shadow-[0_4px_0_rgb(180,83,9)] active:shadow-none active:translate-y-[6px] transition-all duration-150 flex items-center justify-center gap-3 overflow-hidden"
          >
            <Dices
              className={`w-8 h-8 transition-transform duration-500 ${isSpinning ? "animate-spin" : "group-hover:rotate-180"}`}
            />
            <span>ROLL FOR DINNER</span>
          </button>

          {/* Controls row */}
          <div className="flex items-center justify-center gap-4">
            {/* Chaos Toggle */}
            <label className="group inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={chaosMode}
                onChange={() => setChaosMode(!chaosMode)}
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 shadow-inner relative"></div>
              <span className="ml-2 text-xs font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                Chaos
              </span>
            </label>

            <div className="w-px h-4 bg-slate-200" />

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
              title="Reset everything"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-amber-900/20 text-xs font-mono">
            v3.1 • 350°F • 45 MIN
          </p>
        </div>
      </div>
    </div>
  );
}
