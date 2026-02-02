import { useState, useRef, useEffect } from "react";
import { CategoryKey, CATEGORY_LABELS, MULTI_CATEGORIES } from "../data/config";
import { Ingredient, getPool, getAllIngredients } from "../lib/engine";
import {
  Loader2,
  RefreshCw,
  Lock,
  Unlock,
  Plus,
  Minus,
  ChevronDown,
} from "lucide-react";

interface Props {
  categoryKey: CategoryKey;
  ingredients: Ingredient[];
  profile: string;
  chaosMode: boolean;
  stats: { count: number };
  isSpinning: boolean;
  isTargeted: boolean;
  lockedIndices: Set<number>;
  onReroll: (key: CategoryKey, index: number) => void;
  onToggleLock: (key: CategoryKey, index: number) => void;
  onSelectIngredient: (
    key: CategoryKey,
    index: number,
    ingredient: Ingredient,
  ) => void;
  onAddIngredient: (key: CategoryKey) => void;
  onRemoveIngredient: (key: CategoryKey, index: number) => void;
}

export default function IngredientRow({
  categoryKey,
  ingredients,
  profile,
  chaosMode,
  stats,
  isSpinning,
  isTargeted,
  lockedIndices,
  onReroll,
  onToggleLock,
  onSelectIngredient,
  onAddIngredient,
  onRemoveIngredient,
}: Props) {
  const label = CATEGORY_LABELS[categoryKey];
  const canAddMore =
    MULTI_CATEGORIES.includes(categoryKey) && ingredients.length < 3;
  const canRemove = ingredients.length > 1;

  return (
    <div className="space-y-2">
      {/* Category Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-2xl select-none">{label.emoji}</span>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label.name}
        </p>
        <span className="text-[10px] text-amber-500/50 font-mono">
          d{stats.count}
        </span>
        {canAddMore && (
          <button
            onClick={() => onAddIngredient(categoryKey)}
            disabled={isSpinning}
            className="ml-auto p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Add another"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Ingredient Items */}
      {ingredients.map((ingredient, index) => (
        <IngredientItem
          key={`${categoryKey}-${index}-${ingredient.id}`}
          categoryKey={categoryKey}
          ingredient={ingredient}
          index={index}
          profile={profile}
          chaosMode={chaosMode}
          isSpinning={isSpinning}
          isTargeted={isTargeted}
          isLocked={lockedIndices.has(index)}
          canRemove={canRemove}
          onReroll={() => onReroll(categoryKey, index)}
          onToggleLock={() => onToggleLock(categoryKey, index)}
          onSelect={(ing) => onSelectIngredient(categoryKey, index, ing)}
          onRemove={() => onRemoveIngredient(categoryKey, index)}
        />
      ))}
    </div>
  );
}

interface ItemProps {
  categoryKey: CategoryKey;
  ingredient: Ingredient;
  index: number;
  profile: string;
  chaosMode: boolean;
  isSpinning: boolean;
  isTargeted: boolean;
  isLocked: boolean;
  canRemove: boolean;
  onReroll: () => void;
  onToggleLock: () => void;
  onSelect: (ingredient: Ingredient) => void;
  onRemove: () => void;
}

function IngredientItem({
  categoryKey,
  ingredient,
  profile,
  chaosMode,
  isSpinning,
  isTargeted,
  isLocked,
  canRemove,
  onReroll,
  onToggleLock,
  onSelect,
  onRemove,
}: ItemProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get ingredients for dropdown
  const allIngredients = getAllIngredients(categoryKey);
  const filteredPool = chaosMode
    ? allIngredients
    : getPool(categoryKey, profile as any, false);

  // Filter by search
  const searchResults = search
    ? allIngredients.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      )
    : filteredPool;

  // Position dropdown when opened
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 250),
      });
      inputRef.current?.focus();
    }
  }, [showDropdown]);

  // Close dropdown on outside click or scroll
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setSearch("");
      }
    };
    const handleScroll = () => {
      setShowDropdown(false);
      setSearch("");
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClick);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showDropdown]);

  return (
    <div
      className={`group flex items-center gap-2 p-2 pl-3 bg-slate-50 rounded-xl border-2 transition-all duration-300 ${
        isLocked
          ? "border-amber-300 bg-amber-50/50"
          : "border-slate-100 hover:border-amber-200"
      } ${isSpinning && !isTargeted ? "opacity-40 grayscale" : "opacity-100"}`}
    >
      {/* Lock Button */}
      <button
        onClick={onToggleLock}
        className={`p-1.5 rounded-lg transition-colors ${
          isLocked
            ? "text-amber-600 bg-amber-100"
            : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
        }`}
        title={isLocked ? "Unlock ingredient" : "Lock ingredient"}
      >
        {isLocked ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Unlock className="w-4 h-4" />
        )}
      </button>

      {/* Ingredient Name / Dropdown Trigger */}
      <div className="flex-1 min-w-0">
        <button
          ref={buttonRef}
          onClick={() => !isSpinning && setShowDropdown(!showDropdown)}
          disabled={isSpinning}
          className={`w-full flex items-center gap-1 text-left text-slate-800 font-semibold truncate transition-all duration-200 hover:text-amber-700 ${
            isTargeted ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          <span className="truncate">{ingredient?.name || "..."}</span>
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {/* Fixed Position Dropdown (portaled to body level) */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="fixed z-[100] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-300"
              />
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-400">
                  No matches
                </div>
              ) : (
                searchResults.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => {
                      onSelect(ing);
                      setShowDropdown(false);
                      setSearch("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-amber-50 transition-colors flex items-center justify-between ${
                      ing.id === ingredient.id
                        ? "bg-amber-100 text-amber-800"
                        : "text-slate-700"
                    }`}
                  >
                    <span>{ing.name}</span>
                    {ing.tags.length > 0 && (
                      <span className="text-[10px] text-slate-400 truncate ml-2">
                        {ing.tags.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Remove Button */}
      {canRemove && (
        <button
          onClick={onRemove}
          disabled={isSpinning}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove"
        >
          <Minus className="w-4 h-4" />
        </button>
      )}

      {/* Reroll Button */}
      <button
        onClick={onReroll}
        disabled={isSpinning || isLocked}
        className={`p-1.5 rounded-lg transition-colors ${
          isLocked
            ? "text-slate-200 cursor-not-allowed"
            : "text-slate-400 hover:text-amber-600 hover:bg-amber-100 active:scale-90"
        }`}
        title={isLocked ? "Unlock to reroll" : "Reroll"}
      >
        {isTargeted ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
