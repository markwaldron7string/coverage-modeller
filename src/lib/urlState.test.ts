import { encodeState, decodeState } from "./urlState";
import { DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";
import { CoverageType, ScenarioType, PolicyConfig } from "@/types";

const policy = (overrides: Partial<PolicyConfig> = {}): PolicyConfig => ({
  vehicleValue: 20000,
  coverageType: CoverageType.FULL_COVERAGE,
  deductible: 1000,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
  ...overrides,
});

describe("AC2 — null scenario survives a URL round-trip", () => {
  const cfg = (o: Partial<PolicyConfig> = {}): PolicyConfig => ({
    vehicleValue: 20000,
    coverageType: CoverageType.FULL_COVERAGE,
    deductible: 1000,
    selectedScenario: ScenarioType.MINOR_ACCIDENT,
    ...o,
  });

  it("round-trips a null scenario as null", () => {
    const a = cfg({ selectedScenario: null });
    const b = cfg({ selectedScenario: ScenarioType.THEFT });
    const decoded = decodeState(new URLSearchParams(encodeState(a, b)));
    expect(decoded.policyA.selectedScenario).toBeNull();
    expect(decoded.policyB.selectedScenario).toBe(ScenarioType.THEFT);
  });

  it("falls back to the default scenario when the param is absent", () => {
    const decoded = decodeState(new URLSearchParams("av=20000"));
    expect(decoded.policyA.selectedScenario).toBe(DEFAULT_POLICY_A.selectedScenario);
  });
});

describe("encodeState / decodeState", () => {
  it("round-trips both policies losslessly", () => {
    const a = policy({
      vehicleValue: 35000,
      coverageType: CoverageType.LIABILITY_ONLY,
      deductible: 500,
      selectedScenario: ScenarioType.THEFT,
    });
    const b = policy({
      vehicleValue: 12000,
      coverageType: CoverageType.COMPREHENSIVE,
      deductible: 2500,
      selectedScenario: ScenarioType.TOTAL_LOSS,
    });
    const params = new URLSearchParams(encodeState(a, b));
    expect(decodeState(params)).toEqual({ policyA: a, policyB: b });
  });

  it("encodes all eight fields", () => {
    const params = new URLSearchParams(encodeState(policy(), policy()));
    ["av", "ac", "ad", "as", "bv", "bc", "bd", "bs"].forEach((key) => {
      expect(params.has(key)).toBe(true);
    });
  });

  it("falls back to defaults when params are missing entirely", () => {
    expect(decodeState(new URLSearchParams())).toEqual({
      policyA: DEFAULT_POLICY_A,
      policyB: DEFAULT_POLICY_B,
    });
  });

  it("falls back per-field for an invalid number", () => {
    const params = new URLSearchParams("av=not-a-number&ad=750");
    const { policyA } = decodeState(params);
    expect(policyA.vehicleValue).toBe(DEFAULT_POLICY_A.vehicleValue); // bad -> default
    expect(policyA.deductible).toBe(750); // valid -> used
  });

  it("falls back for an unrecognised enum value", () => {
    const params = new URLSearchParams("ac=PLATINUM&as=ALIEN_ABDUCTION");
    const { policyA } = decodeState(params);
    expect(policyA.coverageType).toBe(DEFAULT_POLICY_A.coverageType);
    expect(policyA.selectedScenario).toBe(DEFAULT_POLICY_A.selectedScenario);
  });

  it("rejects negative numbers", () => {
    const params = new URLSearchParams("ad=-500");
    expect(decodeState(params).policyA.deductible).toBe(
      DEFAULT_POLICY_A.deductible,
    );
  });

  it("stays well under 2,000 characters for an extreme valid configuration", () => {
    const big = policy({
      vehicleValue: 150000,
      coverageType: CoverageType.FULL_COVERAGE,
      deductible: 3000,
      selectedScenario: ScenarioType.UNINSURED_MOTORIST,
    });
    const url = `https://coverage-modeller.example.com/?${encodeState(big, big)}`;
    expect(url.length).toBeLessThan(2000);
  });
});