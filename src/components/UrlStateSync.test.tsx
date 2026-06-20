/** @jest-environment jsdom */
import { render, act } from "@testing-library/react";
import { UrlStateSync } from "./UrlStateSync";
import { useScenarioStore } from "@/store/scenarioStore";
import { CoverageType, ScenarioType } from "@/types";

const initialState = useScenarioStore.getState();

beforeEach(() => {
  useScenarioStore.setState(initialState, true);
  window.history.replaceState(null, "", "/");
});

describe("UrlStateSync", () => {
  it("hydrates the store from URL params on mount", () => {
    window.history.replaceState(
      null,
      "",
      "/?av=30000&ac=LIABILITY_ONLY&ad=500&as=THEFT&bv=40000&bc=COMPREHENSIVE&bd=1500&bs=TOTAL_LOSS",
    );
    render(<UrlStateSync />);
    const { policyA, policyB } = useScenarioStore.getState();
    expect(policyA).toEqual({
      vehicleValue: 30000,
      coverageType: CoverageType.LIABILITY_ONLY,
      deductible: 500,
      selectedScenario: ScenarioType.THEFT,
    });
    expect(policyB.vehicleValue).toBe(40000);
    expect(policyB.selectedScenario).toBe(ScenarioType.TOTAL_LOSS);
  });

  it("leaves defaults in place when there are no params", () => {
    render(<UrlStateSync />);
    expect(useScenarioStore.getState().policyA.deductible).toBe(1000);
  });

  it("writes store changes back into the URL", () => {
    render(<UrlStateSync />);
    act(() => {
      useScenarioStore.getState().setVehicleValue("policyA", 99000);
    });
    expect(window.location.search).toContain("av=99000");
  });

  it("reflects the current state in the URL on mount", () => {
    render(<UrlStateSync />);
    // default policy A deductible 1000, policy B deductible 2000
    expect(window.location.search).toContain("ad=1000");
    expect(window.location.search).toContain("bd=2000");
  });
});