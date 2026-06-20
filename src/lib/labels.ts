import { CoverageType, ScenarioType } from "@/types";

/** Human-readable names for each coverage tier. */
export const COVERAGE_LABELS: Record<CoverageType, string> = {
  [CoverageType.LIABILITY_ONLY]: "Liability only",
  [CoverageType.COMPREHENSIVE]: "Comprehensive",
  [CoverageType.FULL_COVERAGE]: "Full coverage",
};

/** Plain-language explanation of what each coverage tier protects. */
export const COVERAGE_DESCRIPTIONS: Record<CoverageType, string> = {
  [CoverageType.LIABILITY_ONLY]:
    "Covers damage you cause to others, not your own vehicle.",
  [CoverageType.COMPREHENSIVE]:
    "Adds theft, weather, and other non-collision damage to your vehicle.",
  [CoverageType.FULL_COVERAGE]:
    "Adds collision, so your vehicle is covered in an accident too.",
};

/** Human-readable names for each claim scenario. */
export const SCENARIO_LABELS: Record<ScenarioType, string> = {
  [ScenarioType.MINOR_ACCIDENT]: "Minor accident",
  [ScenarioType.TOTAL_LOSS]: "Total loss",
  [ScenarioType.THEFT]: "Theft",
  [ScenarioType.WEATHER_DAMAGE]: "Weather damage",
  [ScenarioType.UNINSURED_MOTORIST]: "Uninsured motorist",
};