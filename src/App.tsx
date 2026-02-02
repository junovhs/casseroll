import { useState } from "react";
import { CATEGORIES, FLAVOR_PROFILES, CategoryKey } from "./data/config";
import {
  generateCasserole,
  rerollIngredient,
  getCategoryStats,
  Recipe,
} from "./lib/engine";
import IngredientRow from "./components/IngredientRow";
import { Dices, Sparkles, ChefHat } from "lucide-react";

export default function App() {
  const [recipe, setRecipe] = useState<Recipe>(() => generateCasserole());
  const [chaosMode, setChaosMode] = useState(false);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningCategory, setSpinningCategory] = useState<
    CategoryKey | "ALL" | null
  >(null);

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

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-slate-800 font-sans selection:bg-orange-200 flex flex-col items-center">
      <div className="w-full max-w-md px-4 py-8 flex flex-col min-h-screen">
        {/* Header - Dice Theme */}
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
            className={`text-center mb-6 transition-all duration-300 ${isSpinning && spinningCategory === "ALL" ? "opacity-0 scale-90 blur-sm" : "opacity-100 scale-100"}`}
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
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-200">
                    {currentProfile.emoji} {currentProfile.name}
                  </span>
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
                onReroll={handleSingleReroll}
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
            v2.0 • 350°F • 45 MIN
          </p>
        </div>
      </div>
    </div>
  );
}
