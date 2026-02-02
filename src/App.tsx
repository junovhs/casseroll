import { useState } from "react";
import {
  CATEGORIES,
  FLAVOR_PROFILES,
  CategoryKey,
  ProfileKey,
} from "./data/config";
import {
  generateCasserole,
  rerollIngredient,
  getCategoryStats,
  getPoolForCategory,
  Recipe,
  Ingredient,
} from "./lib/engine";
import IngredientRow from "./components/IngredientRow";
import SelectionModal from "./components/SelectionModal";
import { Dices, Sparkles, ChefHat, ChevronDown, BookOpen } from "lucide-react";

export default function App() {
  const [recipe, setRecipe] = useState<Recipe>(() => generateCasserole());
  const [chaosMode, setChaosMode] = useState(false);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningCategory, setSpinningCategory] = useState<
    CategoryKey | "ALL" | null
  >(null);

  // Modal states
  const [cuisineModalOpen, setCuisineModalOpen] = useState(false);
  const [tipsModalOpen, setTipsModalOpen] = useState(false);

  const currentProfile =
    FLAVOR_PROFILES[recipe.profile as keyof typeof FLAVOR_PROFILES];

  const handleFullRoll = () => {
    setIsSpinning(true);
    setSpinningCategory("ALL");

    setTimeout(() => {
      setRecipe(generateCasserole({ chaosMode }));
      setIsSpinning(false);
      setSpinningCategory(null);
    }, 600);
  };

  const handleSingleReroll = (category: CategoryKey) => {
    setSpinningCategory(category);
    setTimeout(() => {
      setRecipe((prev) => rerollIngredient(prev, category, chaosMode));
      setSpinningCategory(null);
    }, 300);
  };

  const handleSelectIngredient = (
    category: CategoryKey,
    ingredient: Ingredient,
  ) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        [category]: ingredient,
      },
    }));
  };

  const handleSelectCuisine = (profileKey: string) => {
    if (profileKey === recipe.profile) return;
    setRecipe(
      generateCasserole({
        forcedProfile: profileKey as ProfileKey,
        chaosMode: false,
      }),
    );
    setChaosMode(false);
  };

  // Build cuisine options for modal
  const cuisineOptions = Object.entries(FLAVOR_PROFILES).map(
    ([key, value]) => ({
      id: key,
      label: value.name,
      emoji: value.emoji,
    }),
  );

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
        <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/10 border-4 border-white p-6 mb-6 relative overflow-visible transition-all">
          {/* Card Header */}
          <div
            className={`text-center mb-6 transition-all duration-300 ${
              isSpinning && spinningCategory === "ALL"
                ? "opacity-0 scale-90 blur-sm"
                : "opacity-100 scale-100"
            }`}
          >
            <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-3">
              {recipe.name}
            </h2>

            <div className="flex justify-center">
              {recipe.profile === "chaos" ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-purple-200">
                  <Sparkles className="w-3 h-3" /> Wild Magic
                </span>
              ) : (
                currentProfile && (
                  <button
                    onClick={() => setCuisineModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200 hover:bg-amber-200 active:bg-amber-300 transition-colors"
                  >
                    {currentProfile.emoji} {currentProfile.name}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )
              )}
            </div>
          </div>

          {/* Ingredient List */}
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <IngredientRow
                key={cat}
                categoryKey={cat}
                ingredient={recipe.ingredients[cat]}
                stats={getCategoryStats(cat, recipe.profile, chaosMode)}
                isSpinning={isSpinning || !!spinningCategory}
                isTargeted={
                  spinningCategory === cat || spinningCategory === "ALL"
                }
                allOptions={getPoolForCategory(cat, recipe.profile, chaosMode)}
                onReroll={handleSingleReroll}
                onSelect={handleSelectIngredient}
              />
            ))}
          </div>
        </div>

        {/* Action Area */}
        <div className="mt-auto space-y-4 pb-6">
          {/* Tips Button */}
          <button
            onClick={() => setTipsModalOpen(true)}
            className="w-full py-2 text-amber-700 font-medium text-sm flex items-center justify-center gap-2 hover:text-amber-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Casserole Tips & Advice
          </button>

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
                Chaos Mode
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

      {/* Cuisine Selection Modal */}
      <SelectionModal
        isOpen={cuisineModalOpen}
        onClose={() => setCuisineModalOpen(false)}
        onSelect={handleSelectCuisine}
        title="Select Cuisine"
        options={cuisineOptions}
        selectedId={recipe.profile !== "chaos" ? recipe.profile : undefined}
      />

      {/* Tips Modal */}
      {tipsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setTipsModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                🍳 Casserole Basics
              </h3>
              <button
                onClick={() => setTipsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">
                  📐 Standard Size
                </h4>
                <p>
                  These recipes target a 9x13" dish (about 3 quarts). Scale up
                  or down as needed.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">
                  💧 Watch the Moisture
                </h4>
                <p>
                  Wet ingredients (creamed corn, juicy tomatoes) release liquid.
                  If your combo looks wet, either reduce binder or par-bake
                  uncovered first.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">
                  🧂 Salt Fat Acid Heat
                </h4>
                <p className="text-amber-600 italic">
                  Coming soon: balance tracking!
                </p>
                <p>
                  For now: taste as you go. Most proteins and cheeses are salty.
                  Add acid (vinegar, citrus, pickled things) to cut richness.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">
                  🥧 The Crispy Top Rule
                </h4>
                <p>
                  Toppings go on TOP, added in the last 10-15 minutes. Crispy
                  things baked inside become soft (fine for texture, but won't
                  be crispy).
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">
                  🎲 Embrace the Roll
                </h4>
                <p>
                  Weird combo? Lean into it! Some of the best casseroles come
                  from unexpected pairings. Trust the process.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setTipsModalOpen(false)}
                className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
