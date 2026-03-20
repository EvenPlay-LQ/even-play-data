import { Trophy, Flame, Star, Zap } from "lucide-react";

/** Unified level names used across the platform */
export const LEVEL_NAMES: Record<number, string> = {
  1: "Rookie",
  2: "Beginner",
  3: "Developing",
  4: "Competitive",
  5: "Starter",
  6: "Advanced",
  7: "Elite",
  8: "Provincial",
  9: "National Prospect",
  10: "Professional",
};

/** Achievement icon lookup */
export const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  zap: Zap,
};

/** Buzz page post category tabs */
export const BUZZ_CATEGORIES = [
  "All",
  "Transfers",
  "Youth",
  "Local",
  "International",
  "Live Feed",
] as const;

/** Sport filter options for Zone and other pages */
export const SPORT_OPTIONS = [
  "Football",
  "Rugby",
  "Athletics",
  "Cricket",
  "Basketball",
] as const;

/** XP required to reach the next level */
export const xpToNextLevel = (level: number) => (level + 1) * 600;

/** Get a display name for a level number */
export const getLevelName = (level: number) =>
  LEVEL_NAMES[level] || `Level ${level}`;

/** Standardized Performance KPIs across the platform */
export const PERFORMANCE_KPIS = [
  { id: "sprint_40m_s", label: "40m Sprint", unit: "s", category: "Speed & Agility", description: "Measures explosive speed from a standing start." },
  { id: "vo2_max", label: "VO2 Max", unit: "ml/kg/min", category: "Aerobics", description: "Max oxygen utilization during intense exercise." },
  { id: "bench_press_1rm_kg", label: "1RM Bench Press", unit: "kg", category: "Strength & Power", description: "One-Rep Max for upper body strength." },
  { id: "squat_1rm_kg", label: "1RM Squat", unit: "kg", category: "Strength & Power", description: "One-Rep Max for lower body strength." },
  { id: "illinois_agility_s", label: "Illinois Agility", unit: "s", category: "Speed & Agility", description: "Standard test for change of direction speed." },
  { id: "vertical_jump_cm", label: "Vertical Jump", unit: "cm", category: "Strength & Power", description: "Measures explosive lower body power." },
] as const;
