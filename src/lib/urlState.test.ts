import { encodeState, decodeState } from "./urlState";
import { DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";
import { ScenarioType, PolicyConfig } from "@/types";

const cfg = (o: Partial<PolicyConfig> = {}): PolicyConfig => ({
  vehicleValue: 20000,
  comprehensive: true,
  collision: false,
  uninsuredMotorist: true,
  deductible: 1000,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
  ...o,
});

describe("encodeState / decodeState — composable coverage", () => {
  it("round-trips all three coverage booleans independently per policy", () => {
    const a = cfg({ comprehensive: true, collision: false, uninsuredMotorist: true });
    const b = cfg({ comprehensive: false, collision: true, uninsuredMotorist: false });
    const decoded = decodeState(new URLSearchParams(encodeState(a, b)));
    expect(decoded.policyA).toEqual(a);
    expect(decoded.policyB).toEqual(b);
  });

  it("falls back to defaults when params are missing entirely", () => {
    expect(decodeState(new URLSearchParams())).toEqual({
      policyA: DEFAULT_POLICY_A,
      policyB: DEFAULT_POLICY_B,
    });
  });

  it("falls back per-field for a malformed boolean param", () => {
    const params = new URLSearchParams("acomp=maybe&acoll=1");
    const { policyA } = decodeState(params);
    expect(policyA.comprehensive).toBe(DEFAULT_POLICY_A.comprehensive); // bad -> default
    expect(policyA.collision).toBe(true); // valid -> used
  });

  it("round-trips a null scenario", () => {
    const a = cfg({ selectedScenario: null });
    const decoded = decodeState(new URLSearchParams(encodeState(a, cfg())));
    expect(decoded.policyA.selectedScenario).toBeNull();
  });

  it("stays well under 2,000 characters for an extreme valid configuration", () => {
    const big = cfg({ vehicleValue: 150000, deductible: 3000, selectedScenario: ScenarioType.UNINSURED_MOTORIST });
    const url = `https://coverage-modeller.example.com/?${encodeState(big, big)}`;
    expect(url.length).toBeLessThan(2000);
  });
});