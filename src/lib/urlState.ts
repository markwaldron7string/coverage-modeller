import { CoverageType, ScenarioType, PolicyConfig } from "@/types";
import { DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";

const COVERAGE_VALUES = Object.values(CoverageType) as string[];
const SCENARIO_VALUES = Object.values(ScenarioType) as string[];

type Prefix = "a" | "b";

function keysFor(prefix: Prefix) {
  return {
    vehicleValue: `${prefix}v`,
    coverageType: `${prefix}c`,
    deductible: `${prefix}d`,
    selectedScenario: `${prefix}s`,
  };
}

/** Encodes both policies into a query string (no leading "?"). */
export function encodeState(
  policyA: PolicyConfig,
  policyB: PolicyConfig,
): string {
  const params = new URLSearchParams();
  const write = (prefix: Prefix, policy: PolicyConfig) => {
    const k = keysFor(prefix);
    params.set(k.vehicleValue, String(policy.vehicleValue));
    params.set(k.coverageType, policy.coverageType);
    params.set(k.deductible, String(policy.deductible));
    params.set(k.selectedScenario, policy.selectedScenario);
  };
  write("a", policyA);
  write("b", policyB);
  return params.toString();
}

function parseNumber(value: string | null, fallback: number): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseCoverage(
  value: string | null,
  fallback: CoverageType,
): CoverageType {
  return value !== null && COVERAGE_VALUES.includes(value)
    ? (value as CoverageType)
    : fallback;
}

function parseScenario(
  value: string | null,
  fallback: ScenarioType,
): ScenarioType {
  return value !== null && SCENARIO_VALUES.includes(value)
    ? (value as ScenarioType)
    : fallback;
}

function decodePolicy(
  params: URLSearchParams,
  prefix: Prefix,
  fallback: PolicyConfig,
): PolicyConfig {
  const k = keysFor(prefix);
  return {
    vehicleValue: parseNumber(params.get(k.vehicleValue), fallback.vehicleValue),
    coverageType: parseCoverage(params.get(k.coverageType), fallback.coverageType),
    deductible: parseNumber(params.get(k.deductible), fallback.deductible),
    selectedScenario: parseScenario(
      params.get(k.selectedScenario),
      fallback.selectedScenario,
    ),
  };
}

/**
 * Decodes both policies from URL params. Every field falls back to its default
 * independently, so missing or invalid params degrade gracefully.
 */
export function decodeState(params: URLSearchParams): {
  policyA: PolicyConfig;
  policyB: PolicyConfig;
} {
  return {
    policyA: decodePolicy(params, "a", DEFAULT_POLICY_A),
    policyB: decodePolicy(params, "b", DEFAULT_POLICY_B),
  };
}