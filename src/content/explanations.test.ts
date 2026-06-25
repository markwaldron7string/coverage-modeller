import { buildExplanation } from "./explanations";
import { CoverageType, ScenarioType, PolicyConfig } from "@/types";

const policy = (overrides: Partial<PolicyConfig> = {}): PolicyConfig => ({
  vehicleValue: 20000,
  coverageType: CoverageType.FULL_COVERAGE,
  deductible: 1000,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
  ...overrides,
});

describe("buildExplanation", () => {
  it("fills in the formatted vehicle value and deductible", () => {
    const text = buildExplanation(
      policy({ vehicleValue: 35000, deductible: 750 }),
    );
    expect(text).toContain("$35,000");
    expect(text).toContain("$750");
  });

  it("explains that liability only doesn't protect your own vehicle", () => {
    const text = buildExplanation(
      policy({ coverageType: CoverageType.LIABILITY_ONLY }),
    ).toLowerCase();
    expect(text).toContain("liability-only");
    expect(text).toContain("out of pocket");
  });

  it("explains that comprehensive excludes collisions", () => {
    const text = buildExplanation(
      policy({ coverageType: CoverageType.COMPREHENSIVE }),
    ).toLowerCase();
    expect(text).toContain("comprehensive");
    expect(text).toContain("collision");
  });

  it("explains that full coverage covers nearly everything", () => {
    const text = buildExplanation(
      policy({ coverageType: CoverageType.FULL_COVERAGE }),
    ).toLowerCase();
    expect(text).toContain("full coverage");
  });

  it.each([
    CoverageType.LIABILITY_ONLY,
    CoverageType.COMPREHENSIVE,
    CoverageType.FULL_COVERAGE,
  ])("produces grammatically clean output for %s", (coverageType) => {
    const text = buildExplanation(
      policy({ coverageType, vehicleValue: 12345, deductible: 250 }),
    );
    expect(text).not.toMatch(/undefined|NaN/);
    expect(text).not.toMatch(/\s{2,}/); // no double spaces
    expect(text.trim()).toMatch(/^[A-Z].*\.$/s); // capital start, period end
  });
});