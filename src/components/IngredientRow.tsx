import { useState } from "react";
import { CategoryKey, CATEGORY_LABELS, CATEGORY_TIPS } from "../data/config";
import { Ingredient } from "../lib/engine";
import { Loader2, RefreshCw, ChevronDown, Info, X } from "lucide-react";
import SelectionModal from "./SelectionModal";

interface Props {
  categoryKey: CategoryKey;
  ingredient: Ingredient;
  stats: { count: number };
  isSpinning: boolean;
  isTargeted: boolean;
  allOptions: Ingredient[];
  onReroll: (key: CategoryKey) => void;
  onSelect: (key: CategoryKey, ingredient: Ingredient) => void;
}

export default function IngredientRow({
  categoryKey,
  ingredient,
  stats,
  isSpinning,
  isTargeted,
  allOptions,
  onReroll,
  onSelect,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const label = CATEGORY_LABELS[categoryKey];
  const tip = CATEGORY_TIPS[categoryKey];

  const modalOptions = allOptions.map((ing) => ({
    id: ing.id,
    label: ing.name,
  }));

  return (
    <>
      <div
        className={`group relative flex items-center gap-2 p-3 bg-slate-50 rounded-xl border-2 border-slate-100 transition-all duration-300 hover:border-amber-200 ${
          isSpinning && !isTargeted ? "opacity-40 grayscale" : "opacity-100"
        }`}
      >
        {/* Emoji Icon */}
        <span className="text-2xl w-8 text-center select-none filter drop-shadow-sm flex-shrink-0">
          {label.emoji}
        </span>

        {/* Clickable Text Area - opens modal */}
        <button
          onClick={() => setModalOpen(true)}
          disabled={isSpinning}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {label.name}
            </p>
            <span className="text-[10px] text-amber-500/50 font-mono">
              d{stats.count}
            </span>
            {/* Info icon - tap to show tip */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTip(!showTip);
              }}
              className="p-0.5 text-slate-300 hover:text-amber-500 transition-colors"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <p
              className={`text-slate-800 font-semibold truncate transition-all duration-200 ${
                isTargeted
                  ? "opacity-0 translate-y-2"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {ingredient?.name || "..."}
            </p>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </div>
        </button>

        {/* Reroll Button */}
        <button
          onClick={() => onReroll(categoryKey)}
          disabled={isSpinning}
          className="p-2 rounded-lg transition-colors active:scale-90 text-slate-400 hover:text-amber-600 hover:bg-amber-100 flex-shrink-0"
          title={`Reroll ${label.name}`}
        >
          {isTargeted ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
        </button>

        {/* Tip Tooltip */}
        {showTip && (
          <div
            className="absolute left-0 right-0 top-full mt-1 z-40 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-lg animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTip(false)}
              className="absolute top-1 right-1 p-1 hover:bg-slate-700 rounded"
            >
              <X className="w-3 h-3" />
            </button>
            <p className="pr-4">{tip}</p>
          </div>
        )}
      </div>

      {/* Selection Modal */}
      <SelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(id) => {
          const selected = allOptions.find((o) => o.id === id);
          if (selected) onSelect(categoryKey, selected);
        }}
        title={`Select ${label.name}`}
        options={modalOptions}
        selectedId={ingredient?.id}
      />
    </>
  );
}
