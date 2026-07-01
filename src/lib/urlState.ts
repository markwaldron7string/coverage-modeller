import { ScenarioType, PolicyConfig } from "@/types";
import { DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";

const SCENARIO_VALUES = Object.values(ScenarioType) as string[];

type Prefix = "a" | "b";
function keysFor(prefix: Prefix) {
  return {
    vehicleValue: `${prefix}v`,
    comprehensive: `${prefix}comp`,
    collision: `${prefix}coll`,
    uninsuredMotorist: `${prefix}um`,
    deductible: `${prefix}d`,
    selectedScenario: `${prefix}s`,
  };
}

export function encodeState(policyA: PolicyConfig, policyB: PolicyConfig): string {
  const params = new URLSearchParams();
  const write = (prefix: Prefix, p: PolicyConfig) => {
    const k = keysFor(prefix);
    params.set(k.vehicleValue, String(p.vehicleValue));
    params.set(k.comprehensive, p.comprehensive ? "1" : "0");
    params.set(k.collision, p.collision ? "1" : "0");
    params.set(k.uninsuredMotorist, p.uninsuredMotorist ? "1" : "0");
    params.set(k.deductible, String(p.deductible));
    params.set(k.selectedScenario, p.selectedScenario ?? "");
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
function parseBoolean(value: string | null, fallback: boolean): boolean {
  if (value === "1") return true;
  if (value === "0") return false;
  return fallback;
}
function parseScenario(
  value: string | null,
  fallback: ScenarioType | null,
): ScenarioType | null {
  if (value === null) return fallback; // param absent -> default
  if (value === "") return null;       // explicit "no scenario"
  return SCENARIO_VALUES.includes(value) ? (value as ScenarioType) : fallback;
}

function decodePolicy(params: URLSearchParams, prefix: Prefix, fallback: PolicyConfig): PolicyConfig {
  const k = keysFor(prefix);
  return {
    vehicleValue: parseNumber(params.get(k.vehicleValue), fallback.vehicleValue),
    comprehensive: parseBoolean(params.get(k.comprehensive), fallback.comprehensive),
    collision: parseBoolean(params.get(k.collision), fallback.collision),
    uninsuredMotorist: parseBoolean(params.get(k.uninsuredMotorist), fallback.uninsuredMotorist),
    deductible: parseNumber(params.get(k.deductible), fallback.deductible),
    selectedScenario: parseScenario(params.get(k.selectedScenario), fallback.selectedScenario),
  };
}

export function decodeState(params: URLSearchParams): { policyA: PolicyConfig; policyB: PolicyConfig } {
  return {
    policyA: decodePolicy(params, "a", DEFAULT_POLICY_A),
    policyB: decodePolicy(params, "b", DEFAULT_POLICY_B),
  };
}