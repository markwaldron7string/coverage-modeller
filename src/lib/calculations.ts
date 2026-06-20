import { CoverageType, ScenarioType, PolicyConfig } from '@/types';

/**
 * Which scenarios each coverage type actually insures.
 *
 * - Liability only protects other people's property, not your own vehicle, so
 *   it covers none of the first-party damage scenarios. It DOES cover an
 *   uninsured-motorist event, which protects you against an at-fault driver
 *   who has no insurance and attaches even to minimal policies.
 * - Comprehensive adds non-collision losses (theft, weather, a resulting total
 *   loss) but NOT a collision such as a minor accident.
 * - Full coverage adds collision, so it covers every scenario.
 *
 * Using Record<CoverageType, ...> means if you ever add a new CoverageType,
 * TypeScript will force you to decide what it covers here.
 */
const COVERED_SCENARIOS: Record<CoverageType, readonly ScenarioType[]> = {
  [CoverageType.LIABILITY_ONLY]: [ScenarioType.UNINSURED_MOTORIST],
  [CoverageType.COMPREHENSIVE]: [
    ScenarioType.TOTAL_LOSS,
    ScenarioType.THEFT,
    ScenarioType.WEATHER_DAMAGE,
    ScenarioType.UNINSURED_MOTORIST,
  ],
  [CoverageType.FULL_COVERAGE]: [
    ScenarioType.MINOR_ACCIDENT,
    ScenarioType.TOTAL_LOSS,
    ScenarioType.THEFT,
    ScenarioType.WEATHER_DAMAGE,
    ScenarioType.UNINSURED_MOTORIST,
  ],
};

export function isScenarioCovered(
  coverage: CoverageType,
  scenario: ScenarioType,
): boolean {
  return COVERED_SCENARIOS[coverage].includes(scenario);
}

/**
 * Estimated out-of-pocket cost to the policyholder for a given scenario.
 *
 * Modelling note: if the scenario is not covered, no claim flows through this
 * policy, so the cost *through the policy* is 0 (the tool models what the
 * policy does, not the customer's total uninsured loss).
 *
 * For a covered claim the policyholder pays their deductible. For a total loss
 * the insurer's payout is capped at (vehicleValue - deductible), floored at 0 —
 * they never pay more than the car is worth — so the policyholder's out-of-pocket
 * is the deductible, capped at the vehicle value.
 */
export function calculateOutOfPocket(
  config: PolicyConfig,
  scenario: ScenarioType,
): number {
  if (!isScenarioCovered(config.coverageType, scenario)) {
    return 0;
  }

  if (scenario === ScenarioType.TOTAL_LOSS) {
    // Payout = max(0, vehicleValue - deductible); out-of-pocket is the
    // deductible but can never exceed what the vehicle was worth.
    return Math.min(config.deductible, config.vehicleValue);
  }

  // Any other covered scenario: pay the deductible (capped at vehicle value).
  return Math.min(config.deductible, config.vehicleValue);
}

/**
 * Relative cost of each coverage tier. Liability only is the cheap baseline;
 * comprehensive adds non-collision protection; full coverage adds collision.
 * Record<CoverageType, number> forces a value for every tier at compile time.
 */
const COVERAGE_MULTIPLIER: Record<CoverageType, number> = {
  [CoverageType.LIABILITY_ONLY]: 1.0,
  [CoverageType.COMPREHENSIVE]: 1.5,
  [CoverageType.FULL_COVERAGE]: 2.0,
};

/** Baseline annual premium as a fraction of vehicle value, before adjustments. */
const BASE_ANNUAL_RATE = 0.04;

/** Each $1,000 of deductible discounts the premium by this fraction... */
const DEDUCTIBLE_DISCOUNT_PER_1000 = 0.05;
/** ...up to this ceiling, so the premium can never be driven to zero. */
const MAX_DEDUCTIBLE_DISCOUNT = 0.5;

function deductibleFactor(deductible: number): number {
  const discount = Math.min(
    (deductible / 1000) * DEDUCTIBLE_DISCOUNT_PER_1000,
    MAX_DEDUCTIBLE_DISCOUNT,
  );
  return 1 - discount;
}

/**
 * Estimated annual premium for a policy. A modelled approximation, not a real
 * carrier rate.
 *
 * premium = vehicleValue * BASE_ANNUAL_RATE * coverageMultiplier * deductibleFactor
 *
 * The value is intentionally left unrounded so the calculation stays exact
 * (e.g. doubling the vehicle value doubles the premium precisely). Round for
 * display in the UI layer, not here.
 */
export function estimatePremium(config: PolicyConfig): number {
  const base = config.vehicleValue * BASE_ANNUAL_RATE;
  return (
    base *
    COVERAGE_MULTIPLIER[config.coverageType] *
    deductibleFactor(config.deductible)
  );
}

/**
 * Years of premium savings needed for the cheaper-premium policy's saving to
 * offset the extra out-of-pocket risk it carries. Each config is evaluated on
 * its own selectedScenario (the UI aligns both to the same scenario when
 * comparing).
 *
 * Returns Infinity when the two policies cost the same premium, or when the
 * cheaper-premium policy carries no extra out-of-pocket risk — in both cases
 * the pricier policy never pays for itself. Otherwise returns a positive
 * integer (rounded up to a whole year).
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
 * What the insurer pays out for a given scenario.
 *
 * Modelled as the vehicle value minus the deductible, floored at 0 (the insurer
 * never pays more than the car is worth, and never less than nothing). This is
 * consistent with the out-of-pocket model, so for any COVERED scenario:
 *   calculateOutOfPocket(...) + calculateCoveragePayout(...) === vehicleValue
 * An uncovered scenario pays nothing.
 */
export function calculateCoveragePayout(
  config: PolicyConfig,
  scenario: ScenarioType,
): number {
  if (!isScenarioCovered(config.coverageType, scenario)) {
    return 0;
  }
  return Math.max(0, config.vehicleValue - config.deductible);
}