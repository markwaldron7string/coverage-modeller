import { create } from "zustand";
import { CoverageType, ScenarioType, PolicyConfig } from "@/types";
import {
  useScenarioStore,
  DEFAULT_POLICY_A,
  DEFAULT_POLICY_B,
} from "@/store/scenarioStore";

/** Identifies which of the two policy slices an action targets. */
export type PolicyKey = "policyA" | "policyB";

interface ScenarioStore {
  policyA: PolicyConfig;
  policyB: PolicyConfig;
  setVehicleValue: (policy: PolicyKey, vehicleValue: number) => void;
  setCoverageType: (policy: PolicyKey, coverageType: CoverageType) => void;
  setDeductible: (policy: PolicyKey, deductible: number) => void;
  setScenario: (policy: PolicyKey, selectedScenario: ScenarioType | null) => void;
  hydrate: (policyA: PolicyConfig, policyB: PolicyConfig) => void;
}

export const DEFAULT_POLICY_A: PolicyConfig = {
  vehicleValue: 20000,
  coverageType: CoverageType.FULL_COVERAGE,
  deductible: 1000,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
};

// Policy B starts with a higher deductible so the comparison is meaningful on
// first load — the classic trade-off of a lower premium for higher exposure.
export const DEFAULT_POLICY_B: PolicyConfig = {
  ...DEFAULT_POLICY_A,
  deductible: 2000,
};

export const useScenarioStore = create<ScenarioStore>()((set) => ({
  policyA: DEFAULT_POLICY_A,
  policyB: DEFAULT_POLICY_B,

  // Each setter rebuilds only the targeted slice, leaving the other untouched
  // (and reference-stable). The explicit branch keeps it fully typed without a
  // cast — a computed key would widen to a string index and fail to type-check.
  setVehicleValue: (policy, vehicleValue) =>
    set((state) =>
      policy === "policyA"
        ? { policyA: { ...state.policyA, vehicleValue } }
        : { policyB: { ...state.policyB, vehicleValue } },
    ),
  setCoverageType: (policy, coverageType) =>
    set((state) =>
      policy === "policyA"
        ? { policyA: { ...state.policyA, coverageType } }
        : { policyB: { ...state.policyB, coverageType } },
    ),
  setDeductible: (policy, deductible) =>
    set((state) =>
      policy === "policyA"
        ? { policyA: { ...state.policyA, deductible } }
        : { policyB: { ...state.policyB, deductible } },
    ),
  setScenario: (policy, selectedScenario) =>
    set((state) =>
      policy === "policyA"
        ? { policyA: { ...state.policyA, selectedScenario } }
        : { policyB: { ...state.policyB, selectedScenario } },
    ),

  hydrate: (policyA, policyB) => set({ policyA, policyB }),
}));

/**
 * Selector for one policy slice. The slice is already a PolicyConfig, so this
 * returns a stable reference (it only changes when that policy changes) — no
 * useShallow needed when consuming it.
 */
export const selectPolicy =
  (policy: PolicyKey) =>
  (state: ScenarioStore): PolicyConfig =>
    state[policy];