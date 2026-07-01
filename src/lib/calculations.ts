import { ScenarioType, PolicyConfig, CoverageKey } from "@/types";

/** A usable monetary input: a real, non-negative, finite number. */
function isValidAmount(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

/**
 * Which coverage(s) would satisfy a claim under each scenario — any ONE of
 * the listed keys being true is sufficient. Liability never appears here:
 * none of these five scenarios is a claim liability covers (liability pays
 * for damage *you* cause to *someone else*; every scenario here is
 * first-party damage to the policyholder).
 *
 * A total loss can result from either kind of peril — a collision severe
 * enough to total the car, or a comprehensive event (fire, flood, an
 * unrecovered theft) — so either toggle alone covers it. Using
 * Record<ScenarioType, ...> means a sixth scenario won't compile until it's
 * added here, and this single source of truth is shared by isScenarioCovered
 * and the "not covered" messaging in the UI, so they can't drift apart.
 */
const SATISFYING_COVERAGES: Record<ScenarioType, readonly CoverageKey[]> = {
  [ScenarioType.MINOR_ACCIDENT]: ["collision"],
  [ScenarioType.TOTAL_LOSS]: ["comprehensive", "collision"],
  [ScenarioType.THEFT]: ["comprehensive"],
  [ScenarioType.WEATHER_DAMAGE]: ["comprehensive"],
  [ScenarioType.UNINSURED_MOTORIST]: ["uninsuredMotorist"],
};

/** Which coverage(s) would need to be on to cover this scenario. */
export function coveragesNeededFor(scenario: ScenarioType): readonly CoverageKey[] {
  return SATISFYING_COVERAGES[scenario];
}

export function isScenarioCovered(
  config: Pick<PolicyConfig, CoverageKey>,
  scenario: ScenarioType | null,
): boolean {
  if (scenario === null) return false;
  return SATISFYING_COVERAGES[scenario].some((key) => config[key]);
}

/**
 * Estimated out-of-pocket cost to the policyholder for a given scenario.
 *
 * If the scenario isn't covered, no claim flows through this policy, so the
 * cost *through the policy* is 0 (the tool models what the policy does, not
 * the customer's total uninsured loss). For a covered claim — total loss
 * included — the policyholder pays their deductible, capped at the vehicle
 * value (the insurer never pays out more than the car was worth).
 */
export function calculateOutOfPocket(
  config: PolicyConfig,
  scenario: ScenarioType | null,
): number {
  if (!isValidAmount(config.vehicleValue) || !isValidAmount(config.deductible)) {
    return 0;
  }
  if (!isScenarioCovered(config, scenario)) {
    return 0;
  }
  return Math.min(config.deductible, config.vehicleValue);
}

/**
 * Rate adders for each independently-selectable coverage, layered on a
 * liability baseline of 1.0. Collision is priced above comprehensive, which
 * reflects the general real-world pattern that collision claims tend to be
 * more frequent and more expensive than comprehensive ones. This is an
 * illustrative model, not a real carrier rate.
 */
const COMPREHENSIVE_RATE_ADDER = 0.3;
const COLLISION_RATE_ADDER = 0.5;
const UM_RATE_ADDER = 0.15;
const BASE_ANNUAL_RATE = 0.04;
const DEDUCTIBLE_DISCOUNT_PER_1000 = 0.05;
const MAX_DEDUCTIBLE_DISCOUNT = 0.5;

function coverageMultiplier(config: PolicyConfig): number {
  let multiplier = 1.0;
  if (config.comprehensive) multiplier += COMPREHENSIVE_RATE_ADDER;
  if (config.collision) multiplier += COLLISION_RATE_ADDER;
  if (config.uninsuredMotorist) multiplier += UM_RATE_ADDER;
  return multiplier;
}

function deductibleFactor(deductible: number): number {
  const discount = Math.min(
    (deductible / 1000) * DEDUCTIBLE_DISCOUNT_PER_1000,
    MAX_DEDUCTIBLE_DISCOUNT,
  );
  return 1 - discount;
}

/**
 * Estimated annual premium. Intentionally left unrounded so the calculation
 * stays exact; round for display in the UI layer, not here.
 */
export function estimatePremium(config: PolicyConfig): number {
  if (!isValidAmount(config.vehicleValue) || !isValidAmount(config.deductible)) {
    return 0;
  }
  return (
    config.vehicleValue *
    BASE_ANNUAL_RATE *
    coverageMultiplier(config) *
    deductibleFactor(config.deductible)
  );
}

/**
 * Years of premium savings needed for the cheaper-premium policy's saving to
 * offset the extra out-of-pocket risk it carries. Each config is evaluated on
 * its own selectedScenario. Returns Infinity when premiums are equal or the
 * cheaper policy carries no extra out-of-pocket risk.
 */
export function calculateBreakEven(
  configA: PolicyConfig,
  configB: PolicyConfig,
): number {
  const premiumA = estimatePremium(configA);
  const premiumB = estimatePremium(configB);

  if (premiumA === premiumB) {
    return Infinity;
  }

  const [cheaper, dearer] =
    premiumA < premiumB ? [configA, configB] : [configB, configA];
  const annualSaving = Math.abs(premiumA - premiumB);

  const extraOutOfPocket =
    calculateOutOfPocket(cheaper, cheaper.selectedScenario) -
    calculateOutOfPocket(dearer, dearer.selectedScenario);

  if (extraOutOfPocket <= 0) {
    return Infinity;
  }

  return Math.ceil(extraOutOfPocket / annualSaving);
}

/**
 * What the insurer pays out for a covered scenario: vehicle value minus
 * deductible, floored at 0. For any covered scenario:
 *   calculateOutOfPocket(...) + calculateCoveragePayout(...) === vehicleValue
 */
export function calculateCoveragePayout(
  config: PolicyConfig,
  scenario: ScenarioType | null,
): number {
  if (!isValidAmount(config.vehicleValue) || !isValidAmount(config.deductible)) {
    return 0;
  }
  if (!isScenarioCovered(config, scenario)) {
    return 0;
  }
  return Math.max(0, config.vehicleValue - config.deductible);
}