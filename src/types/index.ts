export enum CoverageType {
  LIABILITY_ONLY = 'LIABILITY_ONLY',
  COMPREHENSIVE = 'COMPREHENSIVE',
  FULL_COVERAGE = 'FULL_COVERAGE',
}

export enum ScenarioType {
  MINOR_ACCIDENT = 'MINOR_ACCIDENT',
  TOTAL_LOSS = 'TOTAL_LOSS',
  THEFT = 'THEFT',
  WEATHER_DAMAGE = 'WEATHER_DAMAGE',
  UNINSURED_MOTORIST = 'UNINSURED_MOTORIST',
}

export interface PolicyConfig {
  /** Vehicle value in whole dollars. */
  vehicleValue: number;
  coverageType: CoverageType;
  /** Deductible in whole dollars. */
  deductible: number;
  /** The scenario currently selected in the UI. */
  selectedScenario: ScenarioType;
}

export interface CalculationResult {
  /** What the policyholder pays out of pocket for the scenario. */
  outOfPocketCost: number;
  /** Estimated annual premium for the configured policy. */
  estimatedPremium: number;
  /** Years of premium it takes to justify the higher coverage level. */
  breakEvenYears: number;
  /** What the insurer pays out for the scenario. */
  coveragePayout: number;
}