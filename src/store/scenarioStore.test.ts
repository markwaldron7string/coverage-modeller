import { useScenarioStore, selectPolicy } from "./scenarioStore";
import { CoverageType, ScenarioType } from "@/types";

const initialState = useScenarioStore.getState();

describe("useScenarioStore", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
  });

  it("initialises policy A with the documented defaults", () => {
    const { policyA } = useScenarioStore.getState();
    expect(policyA).toEqual({
      vehicleValue: 20000,
      coverageType: CoverageType.FULL_COVERAGE,
      deductible: 1000,
      selectedScenario: ScenarioType.MINOR_ACCIDENT,
    });
  });

  it("initialises policy B with a higher deductible for a meaningful comparison", () => {
    const { policyB } = useScenarioStore.getState();
    expect(policyB.deductible).toBe(2000);
    expect(policyB.coverageType).toBe(CoverageType.FULL_COVERAGE);
  });

  it("updates only the targeted policy slice", () => {
    useScenarioStore.getState().setVehicleValue("policyA", 35000);
    const state = useScenarioStore.getState();
    expect(state.policyA.vehicleValue).toBe(35000);
    expect(state.policyB.vehicleValue).toBe(20000); // untouched
  });

  it("keeps the other slice reference-stable when one changes", () => {
    const before = useScenarioStore.getState().policyB;
    useScenarioStore.getState().setDeductible("policyA", 250);
    expect(useScenarioStore.getState().policyB).toBe(before); // same reference
  });

  it("setCoverageType targets the right slice", () => {
    useScenarioStore.getState().setCoverageType("policyB", CoverageType.LIABILITY_ONLY);
    expect(useScenarioStore.getState().policyB.coverageType).toBe(
      CoverageType.LIABILITY_ONLY,
    );
    expect(useScenarioStore.getState().policyA.coverageType).toBe(
      CoverageType.FULL_COVERAGE,
    );
  });

  it("setScenario targets the right slice", () => {
    useScenarioStore.getState().setScenario("policyA", ScenarioType.THEFT);
    expect(useScenarioStore.getState().policyA.selectedScenario).toBe(
      ScenarioType.THEFT,
    );
  });

  it("selectPolicy returns the requested slice", () => {
    useScenarioStore.getState().setDeductible("policyB", 750);
    expect(selectPolicy("policyB")(useScenarioStore.getState()).deductible).toBe(
      750,
    );
  });
});

describe("useScenarioStore hydrate", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
  });

  it("replaces both policies in one call", () => {
    const a = {
      vehicleValue: 30000,
      coverageType: CoverageType.LIABILITY_ONLY,
      deductible: 500,
      selectedScenario: ScenarioType.THEFT,
    };
    const b = {
      vehicleValue: 40000,
      coverageType: CoverageType.COMPREHENSIVE,
      deductible: 1500,
      selectedScenario: ScenarioType.TOTAL_LOSS,
    };
    useScenarioStore.getState().hydrate(a, b);
    expect(useScenarioStore.getState().policyA).toEqual(a);
    expect(useScenarioStore.getState().policyB).toEqual(b);
  });
});