export enum ScenarioType {
  MINOR_ACCIDENT = "MINOR_ACCIDENT",
  TOTAL_LOSS = "TOTAL_LOSS",
  THEFT = "THEFT",
  WEATHER_DAMAGE = "WEATHER_DAMAGE",
  UNINSURED_MOTORIST = "UNINSURED_MOTORIST",
}

/**
 * Coverage is modelled the way it actually composes, not as a single
 * exclusive tier: liability is the baseline of every policy here (no toggle
 * of its own — it's near-universally required in some form), and
 * comprehensive, collision, and uninsured/underinsured motorist are each
 * independently selectable, because that's how every state and carrier
 * actually treats them. No state requires comprehensive or collision, and
 * UM/UIM is mandatory in some states, optional-with-opt-out in others, and
 * fully optional elsewhere — none of that is true of a single "coverage
 * tier," which is why this isn't an enum.
 */
export type CoverageKey = "comprehensive" | "collision" | "uninsuredMotorist";

export interface PolicyConfig {
  vehicleValue: number;
  comprehensive: boolean;
  collision: boolean;
  uninsuredMotorist: boolean;
  deductible: number;
  selectedScenario: ScenarioType | null;
}