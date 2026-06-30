import { CoverageType, ScenarioType, PolicyConfig } from "@/types";

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

/** A usable monetary input: a real, non-negative, finite number. */
function isValidAmount(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

export function isScenarioCovered(
  coverage: CoverageType,
  scenario: ScenarioType | null,
): boolean {
  if (scenario === null) return false;
  return COVERED_SCENARIOS[coverage].includes(scenario);
}

export function calculateOutOfPocket(
  config: PolicyConfig,
  scenario: ScenarioType | null,
): number {
  if (!isValidAmount(config.vehicleValue) || !isValidAmount(config.deductible)) {
    return 0;
  }
  if (!isScenarioCovered(config.coverageType, scenario)) {
    return 0;
  }
  // Covered claim: the policyholder pays the deductible, capped at vehicle value
  // (total loss included — the insurer never pays more than the car is worth).
  return Math.min(config.deductible, config.vehicleValue);
}

const COVERAGE_MULTIPLIER: Record<CoverageType, number> = {
  [CoverageType.LIABILITY_ONLY]: 1.0,
  [CoverageType.COMPREHENSIVE]: 1.5,
  [CoverageType.FULL_COVERAGE]: 2.0,
};

const BASE_ANNUAL_RATE = 0.04;
const DEDUCTIBLE_DISCOUNT_PER_1000 = 0.05;
const MAX_DEDUCTIBLE_DISCOUNT = 0.5;

function deductibleFactor(deductible: number): number {
  const discount = Math.min(
    (deductible / 1000) * DEDUCTIBLE_DISCOUNT_PER_1000,
    MAX_DEDUCTIBLE_DISCOUNT,
  );
  return 1 - discount;
}

export function estimatePremium(config: PolicyConfig): number {
  if (!isValidAmount(config.vehicleValue) || !isValidAmount(config.deductible)) {
    return 0;
  }
  const base = config.vehicleValue * BASE_ANNUAL_RATE;
  return (
    base *
    COVERAGE_MULTIPLIER[config.coverageType] *
    deductibleFactor(config.deductible)
  );
}

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

export function calculateCoveragePayout(
  config: PolicyConfig,
  scenario: ScenarioType | null,
): number {
  if (!isValidAmount(config.vehicleValue) || !isValidAmount(config.deductible)) {
    return 0;
  }
  if (!isScenarioCovered(config.coverageType, scenario)) {
    return 0;
  }
  return Math.max(0, config.vehicleValue - config.deductible);
}