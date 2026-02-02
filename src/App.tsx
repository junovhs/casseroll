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
} from "lucide-react";

type LockState = Record<CategoryKey, Set<number>>;

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
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(recipe.name);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const currentProfile =
    FLAVOR_PROFILES[recipe.profile as keyof typeof FLAVOR_PROFILES];

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
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

  // Get locked ingredients for full roll
  const getLockedIngredients = ():
    | Record<CategoryKey, Ingredient[]>
    | undefined => {
    const locked: Record<CategoryKey, Ingredient[]> = {} as any;
    let hasLocks = false;

    CATEGORIES.forEach((cat) => {
      const lockedIndices = ingredientLocks[cat];
      if (lockedIndices.size > 0) {
        hasLocks = true;
        locked[cat] = recipe.ingredients[cat].filter((_, i) =>
          lockedIndices.has(i),
        );
      }
    });

    return hasLocks ? locked : undefined;
  };

  const handleFullRoll = () => {
    setIsSpinning(true);
    setSpinningCategory("ALL");

    setTimeout(() => {
      const newRecipe = generateCasserole({
        chaosMode,
        lockedProfile: profileLocked ? recipe.profile : undefined,
        lockedIngredients: getLockedIngredients(),
      });

      // Preserve name if user edited it
      if (editingName || nameInput !== recipe.name) {
        newRecipe.name = nameInput;
      }

      setRecipe(newRecipe);
      setNameInput(newRecipe.name);
      setIsSpinning(false);
      setSpinningCategory(null);
    }, 600);
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
        // i === index is removed
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
        <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/10 border-4 border-white p-6 mb-6 relative overflow-hidden transition-all">
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
                  className="text-2xl font-bold text-slate-800 text-center bg-amber-50 border-2 border-amber-200 rounded-lg px-3 py-1 focus:outline-none focus:border-amber-400"
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
            <div
              className="flex justify-center items-center gap-2"
              ref={profileDropdownRef}
            >
              {recipe.profile === "chaos" ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-purple-200">
                  <Sparkles className="w-3 h-3" /> Wild Magic
                </span>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200 hover:bg-amber-200 transition-colors"
                  >
                    {currentProfile?.emoji} {currentProfile?.name}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showProfileDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[200px]">
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
                </div>
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
        <div className="mt-auto space-y-5 pb-6">
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

          {/* Chaos Toggle */}
          <div className="flex justify-center">
            <label className="group relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={chaosMode}
                onChange={() => setChaosMode(!chaosMode)}
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
              <span className="ml-3 text-sm font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
                Total Chaos Mode
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-amber-900/20 text-xs font-mono">
            v3.0 • 350°F • 45 MIN
          </p>
        </div>
      </div>
    </div>
  );
}
