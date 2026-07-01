import { useScenarioStore, DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "./scenarioStore";
import { ScenarioType } from "@/types";

const initialState = useScenarioStore.getState();
beforeEach(() => useScenarioStore.setState(initialState, true));

describe("useScenarioStore — composable coverage toggles", () => {
  it("toggles comprehensive/collision/uninsuredMotorist independently per policy", () => {
    useScenarioStore.getState().setComprehensive("policyA", false);
    useScenarioStore.getState().setCollision("policyA", false);
    useScenarioStore.getState().setUninsuredMotorist("policyB", false);

    const { policyA, policyB } = useScenarioStore.getState();
    expect(policyA.comprehensive).toBe(false);
    expect(policyA.collision).toBe(false);
    expect(policyA.uninsuredMotorist).toBe(DEFAULT_POLICY_A.uninsuredMotorist); // untouched
    expect(policyB.uninsuredMotorist).toBe(false);
    expect(policyB.comprehensive).toBe(DEFAULT_POLICY_B.comprehensive); // untouched
  });

  it("hydrate replaces both policies in one call", () => {
    const a = { ...DEFAULT_POLICY_A, comprehensive: false, selectedScenario: ScenarioType.THEFT };
    const b = { ...DEFAULT_POLICY_B, collision: false };
    useScenarioStore.getState().hydrate(a, b);
    expect(useScenarioStore.getState().policyA).toEqual(a);
    expect(useScenarioStore.getState().policyB).toEqual(b);
  });
});