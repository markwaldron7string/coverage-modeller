import { CoverageKey, ScenarioType } from "@/types";

// Liability has no toggle (it's the implicit baseline), so it has no label
// here — these describe the three independently-selectable coverages.
export const COMPREHENSIVE_LABEL = "Comprehensive";
export const COMPREHENSIVE_DESCRIPTION =
  "Covers theft, weather, and other non-collision damage to your vehicle.";

export const COLLISION_LABEL = "Collision";
export const COLLISION_DESCRIPTION =
  "Covers damage to your vehicle from an accident, regardless of fault.";

export const UM_LABEL = "Uninsured/underinsured motorist";
export const UM_DESCRIPTION =
  "Covers you if you're hit by a driver who can't pay for your costs themselves.";

/** Looks up a coverage's display label by its store key — used to build the
 * "not covered" message from the same coveragesNeededFor(...) mapping the
 * calculation layer uses, so the two can't drift apart. */
export const COVERAGE_KEY_LABELS: Record<CoverageKey, string> = {
  comprehensive: COMPREHENSIVE_LABEL,
  collision: COLLISION_LABEL,
  uninsuredMotorist: UM_LABEL,
};

export const SCENARIO_LABELS: Record<ScenarioType, string> = {
  [ScenarioType.MINOR_ACCIDENT]: "Minor accident",
  [ScenarioType.TOTAL_LOSS]: "Total loss",
  [ScenarioType.THEFT]: "Theft",
  [ScenarioType.WEATHER_DAMAGE]: "Weather damage",
  [ScenarioType.UNINSURED_MOTORIST]: "Uninsured motorist",
};