import { CategoryKey, CATEGORY_LABELS } from "../data/config";
import { Ingredient } from "../lib/engine";
import { Loader2, RefreshCw } from "lucide-react";

interface Props {
  categoryKey: CategoryKey;
  ingredient: Ingredient;
  stats: { count: number };
  isSpinning: boolean;
  isTargeted: boolean;
  onReroll: (key: CategoryKey) => void;
}

export default function IngredientRow({
  categoryKey,
  ingredient,
  stats,
  isSpinning,
  isTargeted,
  onReroll,
}: Props) {
  const label = CATEGORY_LABELS[categoryKey];

  return (
    <div
      className={`group flex items-center gap-3 p-3 bg-slate-50 rounded-xl border-2 border-slate-100 transition-all duration-300 hover:border-amber-200 ${
        isSpinning && !isTargeted ? "opacity-40 grayscale" : "opacity-100"
      }`}
    >
      {/* Emoji Icon */}
      <span className="text-3xl w-10 text-center select-none filter drop-shadow-sm">
        {label.emoji}
      </span>

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label.name}
          </p>
          <span className="text-[10px] text-amber-500/50 font-mono">
            d{stats.count}
          </span>
        </div>

        <p
          className={`text-slate-800 font-semibold truncate transition-all duration-200 ${
            isTargeted ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {ingredient?.name || "..."}
        </p>
      </div>

      {/* Reroll Button */}
      <button
        onClick={() => onReroll(categoryKey)}
        disabled={isSpinning}
        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors active:scale-90"
        title={`Reroll ${label.name}`}
      >
        {isTargeted ? (
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        ) : (
          <RefreshCw className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
