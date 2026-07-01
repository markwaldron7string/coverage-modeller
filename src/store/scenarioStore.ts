import { create } from "zustand";
import { ScenarioType, PolicyConfig } from "@/types";

export type PolicyKey = "policyA" | "policyB";

export const DEFAULT_POLICY_A: PolicyConfig = {
  vehicleValue: 20000,
  comprehensive: true,
  collision: true,
  uninsuredMotorist: true,
  deductible: 1000,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
};
// Policy B starts with a higher deductible so the comparison is meaningful on
// first load — the classic trade-off of a lower premium for higher exposure.
export const DEFAULT_POLICY_B: PolicyConfig = {
  ...DEFAULT_POLICY_A,
  deductible: 2000,
};

interface ScenarioState {
  policyA: PolicyConfig;
  policyB: PolicyConfig;
  setVehicleValue: (policy: PolicyKey, vehicleValue: number) => void;
  setComprehensive: (policy: PolicyKey, comprehensive: boolean) => void;
  setCollision: (policy: PolicyKey, collision: boolean) => void;
  setUninsuredMotorist: (policy: PolicyKey, uninsuredMotorist: boolean) => void;
  setDeductible: (policy: PolicyKey, deductible: number) => void;
  setScenario: (policy: PolicyKey, selectedScenario: ScenarioType | null) => void;
  hydrate: (policyA: PolicyConfig, policyB: PolicyConfig) => void;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  policyA: DEFAULT_POLICY_A,
  policyB: DEFAULT_POLICY_B,
  setVehicleValue: (policy, vehicleValue) =>
    set((s) => (policy === "policyA"
      ? { policyA: { ...s.policyA, vehicleValue } }
      : { policyB: { ...s.policyB, vehicleValue } })),
  setComprehensive: (policy, comprehensive) =>
    set((s) => (policy === "policyA"
      ? { policyA: { ...s.policyA, comprehensive } }
      : { policyB: { ...s.policyB, comprehensive } })),
  setCollision: (policy, collision) =>
    set((s) => (policy === "policyA"
      ? { policyA: { ...s.policyA, collision } }
      : { policyB: { ...s.policyB, collision } })),
  setUninsuredMotorist: (policy, uninsuredMotorist) =>
    set((s) => (policy === "policyA"
      ? { policyA: { ...s.policyA, uninsuredMotorist } }
      : { policyB: { ...s.policyB, uninsuredMotorist } })),
  setDeductible: (policy, deductible) =>
    set((s) => (policy === "policyA"
      ? { policyA: { ...s.policyA, deductible } }
      : { policyB: { ...s.policyB, deductible } })),
  setScenario: (policy, selectedScenario) =>
    set((s) => (policy === "policyA"
      ? { policyA: { ...s.policyA, selectedScenario } }
      : { policyB: { ...s.policyB, selectedScenario } })),
  hydrate: (policyA, policyB) => set({ policyA, policyB }),
}));