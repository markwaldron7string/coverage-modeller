import {
  calculateOutOfPocket,
  calculateCoveragePayout,
  estimatePremium,
  isScenarioCovered,
  coveragesNeededFor,
} from "./calculations";
import { ScenarioType, PolicyConfig } from "@/types";

const cfg = (o: Partial<PolicyConfig> = {}): PolicyConfig => ({
  vehicleValue: 20000,
  comprehensive: false,
  collision: false,
  uninsuredMotorist: false,
  deductible: 1000,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
  ...o,
});

describe("coverage composition", () => {
  it("liability alone (everything off) covers none of the five scenarios", () => {
    const liabilityOnly = cfg();
    for (const scenario of Object.values(ScenarioType)) {
      expect(isScenarioCovered(liabilityOnly, scenario)).toBe(false);
    }
  });

  it("minor accident requires collision specifically", () => {
    expect(isScenarioCovered(cfg({ collision: true }), ScenarioType.MINOR_ACCIDENT)).toBe(true);
    expect(isScenarioCovered(cfg({ comprehensive: true }), ScenarioType.MINOR_ACCIDENT)).toBe(false);
  });

  it("theft and weather damage require comprehensive specifically", () => {
    expect(isScenarioCovered(cfg({ comprehensive: true }), ScenarioType.THEFT)).toBe(true);
    expect(isScenarioCovered(cfg({ collision: true }), ScenarioType.THEFT)).toBe(false);
    expect(isScenarioCovered(cfg({ comprehensive: true }), ScenarioType.WEATHER_DAMAGE)).toBe(true);
    expect(isScenarioCovered(cfg({ collision: true }), ScenarioType.WEATHER_DAMAGE)).toBe(false);
  });

  it("total loss is covered by EITHER comprehensive or collision alone", () => {
    expect(isScenarioCovered(cfg({ collision: true }), ScenarioType.TOTAL_LOSS)).toBe(true);
    expect(isScenarioCovered(cfg({ comprehensive: true }), ScenarioType.TOTAL_LOSS)).toBe(true);
    expect(isScenarioCovered(cfg(), ScenarioType.TOTAL_LOSS)).toBe(false);
  });

  it("uninsured motorist requires that toggle specifically, independent of comp/collision", () => {
    expect(isScenarioCovered(cfg({ uninsuredMotorist: true }), ScenarioType.UNINSURED_MOTORIST)).toBe(true);
    expect(
      isScenarioCovered(
        cfg({ comprehensive: true, collision: true }),
        ScenarioType.UNINSURED_MOTORIST,
      ),
    ).toBe(false);
  });

  it("null scenario is never covered", () => {
    expect(isScenarioCovered(cfg({ comprehensive: true, collision: true, uninsuredMotorist: true }), null)).toBe(false);
  });
});

describe("calculateOutOfPocket / calculateCoveragePayout respect coverage composition", () => {
  it("is $0 for an uncovered scenario regardless of deductible", () => {
    const liabilityOnly = cfg({ deductible: 500 });
    expect(calculateOutOfPocket(liabilityOnly, ScenarioType.THEFT)).toBe(0);
    expect(calculateCoveragePayout(liabilityOnly, ScenarioType.THEFT)).toBe(0);
  });

  it("out-of-pocket + payout equals vehicle value for a covered claim", () => {
    const config = cfg({ collision: true, vehicleValue: 20000, deductible: 1000 });
    const outOfPocket = calculateOutOfPocket(config, ScenarioType.MINOR_ACCIDENT);
    const payout = calculateCoveragePayout(config, ScenarioType.MINOR_ACCIDENT);
    expect(outOfPocket + payout).toBe(20000);
  });
});

describe("AC3 — calc functions return 0 (never NaN/undefined) for invalid input", () => {
  const bad = [NaN, Infinity, -Infinity, -500];
  it.each(bad)("calculateOutOfPocket is 0 for vehicleValue %p", (v) => {
    const out = calculateOutOfPocket(
      cfg({ vehicleValue: v, collision: true }),
      ScenarioType.MINOR_ACCIDENT,
    );
    expect(out).toBe(0);
    expect(Number.isNaN(out)).toBe(false);
  });
  it.each(bad)("estimatePremium is 0 for deductible %p", (d) => {
    expect(estimatePremium(cfg({ deductible: d }))).toBe(0);
  });
});

describe("AC4 — deductible larger than vehicle value is handled gracefully", () => {
  it("caps out-of-pocket at the vehicle value and floors payout at 0", () => {
    const config = cfg({ vehicleValue: 5000, deductible: 8000, collision: true });
    expect(calculateOutOfPocket(config, ScenarioType.MINOR_ACCIDENT)).toBe(5000);
    expect(calculateCoveragePayout(config, ScenarioType.MINOR_ACCIDENT)).toBe(0);
  });
});

describe("coveragesNeededFor — the same source of truth the UI reuses", () => {
  it("returns the coverage(s) that satisfy each scenario", () => {
    expect(coveragesNeededFor(ScenarioType.MINOR_ACCIDENT)).toEqual(["collision"]);
    expect(coveragesNeededFor(ScenarioType.THEFT)).toEqual(["comprehensive"]);
    expect(coveragesNeededFor(ScenarioType.WEATHER_DAMAGE)).toEqual(["comprehensive"]);
    expect(coveragesNeededFor(ScenarioType.TOTAL_LOSS)).toEqual(["comprehensive", "collision"]);
    expect(coveragesNeededFor(ScenarioType.UNINSURED_MOTORIST)).toEqual(["uninsuredMotorist"]);
  });
});

describe("estimatePremium — coverage adders are additive on the liability baseline", () => {
  it("liability alone is the baseline rate", () => {
    const liabilityOnly = cfg({ vehicleValue: 20000, deductible: 1000 });
    // 20000 * 0.04 * 1.0 * (1 - 0.05) = 760
    expect(estimatePremium(liabilityOnly)).toBeCloseTo(760, 5);
  });
  it("each coverage adds its own rate independently of the others", () => {
    const allThree = cfg({
      vehicleValue: 20000, deductible: 1000,
      comprehensive: true, collision: true, uninsuredMotorist: true,
    });
    // multiplier = 1 + 0.3 + 0.5 + 0.15 = 1.95
    expect(estimatePremium(allThree)).toBeCloseTo(20000 * 0.04 * 1.95 * 0.95, 5);
  });
});