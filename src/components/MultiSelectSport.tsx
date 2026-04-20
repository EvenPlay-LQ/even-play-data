import { Check } from "lucide-react";
import { SPORT_OPTIONS } from "@/config/constants";

export function MultiSelectSport({
  selected,
  onChange,
  maxChoices = undefined,
}: {
  selected: string[];
  onChange: (sports: string[]) => void;
  maxChoices?: number;
}) {
  const toggleSport = (sport: string) => {
    if (selected.includes(sport)) {
      onChange(selected.filter((s) => s !== sport));
    } else {
      if (maxChoices && selected.length >= maxChoices) {
        return; // Alternatively, remove the last one and add the new one, but blocking is standard
      }
      onChange([...selected, sport]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SPORT_OPTIONS.map((sport) => {
        const isSelected = selected.includes(sport);
        const isPrimary = selected.length > 0 && selected[0] === sport;

        return (
          <button
            key={sport}
            type="button"
            onClick={() => toggleSport(sport)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-sm ${
              isSelected
                ? isPrimary
                  ? "bg-primary text-primary-foreground border-primary shadow-primary/20 scale-105"
                  : "bg-primary/90 text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted"
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5" />}
            {sport}
            {isPrimary && <span className="ml-1 text-[10px] opacity-80">(Primary)</span>}
          </button>
        );
      })}
    </div>
  );
}
