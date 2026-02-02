import { useEffect } from "react";
import { X } from "lucide-react";

interface SelectionOption {
  id: string;
  label: string;
  emoji?: string;
  sublabel?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  title: string;
  options: SelectionOption[];
  selectedId?: string;
}

export default function SelectionModal({
  isOpen,
  onClose,
  onSelect,
  title,
  options,
  selectedId,
}: Props) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md max-h-[80vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Options */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onSelect(option.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                selectedId === option.id
                  ? "bg-amber-100 border-2 border-amber-300"
                  : "hover:bg-slate-50 border-2 border-transparent active:bg-slate-100"
              }`}
            >
              {option.emoji && (
                <span className="text-2xl w-8 text-center flex-shrink-0">
                  {option.emoji}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {option.label}
                </p>
                {option.sublabel && (
                  <p className="text-sm text-slate-500 truncate">
                    {option.sublabel}
                  </p>
                )}
              </div>
              {selectedId === option.id && (
                <span className="text-amber-600 font-bold flex-shrink-0">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Safe area padding for mobile */}
        <div
          className="flex-shrink-0 pb-safe"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
        />
      </div>
    </div>
  );
}
