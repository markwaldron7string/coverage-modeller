import {
  calculateOutOfPocket,
  estimatePremium,
  calculateBreakEven,
  calculateCoveragePayout,
  isScenarioCovered,
} from './calculations';
import { CoverageType, ScenarioType, PolicyConfig } from '@/types';

const baseConfig: PolicyConfig = {
  vehicleValue: 20000,
  coverageType: CoverageType.FULL_COVERAGE,
  deductible: 500,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
};

describe("AC3 — calc functions return 0 (never NaN/undefined) for invalid input", () => {
  const cfg = (o: Partial<PolicyConfig> = {}): PolicyConfig => ({
    vehicleValue: 20000,
    coverageType: CoverageType.FULL_COVERAGE,
    deductible: 1000,
    selectedScenario: ScenarioType.MINOR_ACCIDENT,
    ...o,
  });
  const bad = [NaN, Infinity, -Infinity, -500];

  it.each(bad)("calculateOutOfPocket is 0 for vehicleValue %p", (v) => {
    const out = calculateOutOfPocket(cfg({ vehicleValue: v }), ScenarioType.MINOR_ACCIDENT);
    expect(out).toBe(0);
    expect(Number.isNaN(out)).toBe(false);
  });

  it.each(bad)("estimatePremium is 0 for deductible %p", (d) => {
    expect(estimatePremium(cfg({ deductible: d }))).toBe(0);
  });

  it.each(bad)("calculateCoveragePayout is 0 for vehicleValue %p", (v) => {
    expect(calculateCoveragePayout(cfg({ vehicleValue: v }), ScenarioType.THEFT)).toBe(0);
  });
});

describe("AC4 — deductible larger than vehicle value is handled gracefully", () => {
  const cfg = (o: Partial<PolicyConfig> = {}): PolicyConfig => ({
    vehicleValue: 5000,
    coverageType: CoverageType.FULL_COVERAGE,
    deductible: 8000,
    selectedScenario: ScenarioType.MINOR_ACCIDENT,
    ...o,
  });

  it("caps out-of-pocket at the vehicle value", () => {
    expect(calculateOutOfPocket(cfg(), ScenarioType.MINOR_ACCIDENT)).toBe(5000);
  });

  it("floors the payout at 0 (never negative)", () => {
    expect(calculateCoveragePayout(cfg(), ScenarioType.MINOR_ACCIDENT)).toBe(0);
  });
});

describe("AC2 — a null scenario behaves like 'not covered'", () => {
  const cfg = (o: Partial<PolicyConfig> = {}): PolicyConfig => ({
    vehicleValue: 20000,
    coverageType: CoverageType.FULL_COVERAGE,
    deductible: 1000,
    selectedScenario: null,
    ...o,
  });

  it("isScenarioCovered is false for null", () => {
    expect(isScenarioCovered(CoverageType.FULL_COVERAGE, null)).toBe(false);
  });

  it("out-of-pocket and payout are 0 for a null scenario", () => {
    expect(calculateOutOfPocket(cfg(), null)).toBe(0);
    expect(calculateCoveragePayout(cfg(), null)).toBe(0);
  });
});

describe('calculateOutOfPocket', () => {
  describe('liability-only coverage (own-vehicle damage not covered)', () => {
    const config: PolicyConfig = { ...baseConfig, coverageType: CoverageType.LIABILITY_ONLY };

    it('returns 0 for a minor accident', () => {
      expect(calculateOutOfPocket(config, ScenarioType.MINOR_ACCIDENT)).toBe(0);
    });
    it('returns 0 for a total loss', () => {
      expect(calculateOutOfPocket(config, ScenarioType.TOTAL_LOSS)).toBe(0);
    });
    it('returns 0 for theft', () => {
      expect(calculateOutOfPocket(config, ScenarioType.THEFT)).toBe(0);
    });
    it('returns 0 for weather damage', () => {
      expect(calculateOutOfPocket(config, ScenarioType.WEATHER_DAMAGE)).toBe(0);
    });
    it('applies the deductible to an uninsured-motorist claim', () => {
      expect(calculateOutOfPocket(config, ScenarioType.UNINSURED_MOTORIST)).toBe(500);
    });
  });

  describe('comprehensive coverage (everything except collision)', () => {
    const config: PolicyConfig = { ...baseConfig, coverageType: CoverageType.COMPREHENSIVE };

    it('returns 0 for a minor accident (collision is not covered)', () => {
      expect(calculateOutOfPocket(config, ScenarioType.MINOR_ACCIDENT)).toBe(0);
    });
    it('applies the deductible to a total loss', () => {
      expect(calculateOutOfPocket(config, ScenarioType.TOTAL_LOSS)).toBe(500);
    });
    it('applies the deductible to theft', () => {
      expect(calculateOutOfPocket(config, ScenarioType.THEFT)).toBe(500);
    });
    it('applies the deductible to weather damage', () => {
      expect(calculateOutOfPocket(config, ScenarioType.WEATHER_DAMAGE)).toBe(500);
    });
    it('applies the deductible to an uninsured-motorist claim', () => {
      expect(calculateOutOfPocket(config, ScenarioType.UNINSURED_MOTORIST)).toBe(500);
    });
  });

  describe('full coverage (covers all scenarios)', () => {
    const config: PolicyConfig = { ...baseConfig, coverageType: CoverageType.FULL_COVERAGE };

    it('applies the deductible to a minor accident', () => {
      expect(calculateOutOfPocket(config, ScenarioType.MINOR_ACCIDENT)).toBe(500);
    });
    it('applies the deductible to a total loss', () => {
      expect(calculateOutOfPocket(config, ScenarioType.TOTAL_LOSS)).toBe(500);
    });
    it('applies the deductible to theft', () => {
      expect(calculateOutOfPocket(config, ScenarioType.THEFT)).toBe(500);
    });
    it('applies the deductible to weather damage', () => {
      expect(calculateOutOfPocket(config, ScenarioType.WEATHER_DAMAGE)).toBe(500);
    });
    it('applies the deductible to an uninsured-motorist claim', () => {
      expect(calculateOutOfPocket(config, ScenarioType.UNINSURED_MOTORIST)).toBe(500);
    });
  });

  describe('edge cases', () => {
    it('caps total-loss out-of-pocket at the vehicle value when the deductible exceeds it', () => {
      const config: PolicyConfig = {
        vehicleValue: 20000,
        coverageType: CoverageType.FULL_COVERAGE,
        deductible: 25000,
        selectedScenario: ScenarioType.TOTAL_LOSS,
      };
      expect(calculateOutOfPocket(config, ScenarioType.TOTAL_LOSS)).toBe(20000);
    });

    it('returns 0 for a covered scenario with a zero deductible', () => {
      const config: PolicyConfig = { ...baseConfig, deductible: 0 };
      expect(calculateOutOfPocket(config, ScenarioType.MINOR_ACCIDENT)).toBe(0);
    });

    it('caps a non-total-loss covered claim at the vehicle value too', () => {
      const config: PolicyConfig = {
        vehicleValue: 8000,
        coverageType: CoverageType.FULL_COVERAGE,
        deductible: 10000,
        selectedScenario: ScenarioType.THEFT,
      };
      expect(calculateOutOfPocket(config, ScenarioType.THEFT)).toBe(8000);
    });
  });
});

describe('estimatePremium', () => {
  const config = (
    overrides: Partial<PolicyConfig> = {},
  ): PolicyConfig => ({
    vehicleValue: 20000,
    coverageType: CoverageType.FULL_COVERAGE,
    deductible: 500,
    selectedScenario: ScenarioType.MINOR_ACCIDENT,
    ...overrides,
  });

  it('returns a positive premium for a typical policy', () => {
    expect(estimatePremium(config())).toBeGreaterThan(0);
  });

  describe('coverage type ordering (same vehicle value and deductible)', () => {
    const liability = estimatePremium(config({ coverageType: CoverageType.LIABILITY_ONLY }));
    const comprehensive = estimatePremium(config({ coverageType: CoverageType.COMPREHENSIVE }));
    const full = estimatePremium(config({ coverageType: CoverageType.FULL_COVERAGE }));

    it('charges more for comprehensive than liability only', () => {
      expect(comprehensive).toBeGreaterThan(liability);
    });
    it('charges more for full coverage than comprehensive', () => {
      expect(full).toBeGreaterThan(comprehensive);
    });
    it('charges more for full coverage than liability only', () => {
      expect(full).toBeGreaterThan(liability);
    });
  });

  describe('deductible inversely affects premium (same coverage and vehicle value)', () => {
    it('charges less for a higher deductible under full coverage', () => {
      expect(estimatePremium(config({ deductible: 2000 }))).toBeLessThan(
        estimatePremium(config({ deductible: 250 })),
      );
    });
    it('charges less for a higher deductible under comprehensive', () => {
      const cheap = estimatePremium(config({ coverageType: CoverageType.COMPREHENSIVE, deductible: 2000 }));
      const dear = estimatePremium(config({ coverageType: CoverageType.COMPREHENSIVE, deductible: 250 }));
      expect(cheap).toBeLessThan(dear);
    });
    it('decreases monotonically as the deductible rises', () => {
      const premiums = [0, 500, 1000, 2000, 4000].map((d) =>
        estimatePremium(config({ deductible: d })),
      );
      for (let i = 1; i < premiums.length; i++) {
        expect(premiums[i]).toBeLessThan(premiums[i - 1]);
      }
    });
  });

  describe('proportional scaling with vehicle value', () => {
    it('doubles the premium when the vehicle value doubles', () => {
      const single = estimatePremium(config({ vehicleValue: 15000 }));
      const double = estimatePremium(config({ vehicleValue: 30000 }));
      expect(double).toBeCloseTo(single * 2);
    });
    it('keeps premium-per-dollar constant across vehicle values', () => {
      const a = estimatePremium(config({ vehicleValue: 12000 })) / 12000;
      const b = estimatePremium(config({ vehicleValue: 48000 })) / 48000;
      expect(a).toBeCloseTo(b);
    });
  });

  describe('edge cases', () => {
    it('applies no discount at a zero deductible', () => {
      // base * coverage * 1.0 = 20000 * 0.04 * 2.0 = 1600
      expect(estimatePremium(config({ deductible: 0 }))).toBeCloseTo(1600);
    });
    it('caps the deductible discount so the premium stays positive', () => {
      // huge deductible -> 50% discount floor -> 1600 * 0.5 = 800
      const premium = estimatePremium(config({ deductible: 1000000 }));
      expect(premium).toBeGreaterThan(0);
      expect(premium).toBeCloseTo(800);
    });
  });
});

describe('calculateBreakEven', () => {
  const config = (overrides: Partial<PolicyConfig> = {}): PolicyConfig => ({
    vehicleValue: 20000,
    coverageType: CoverageType.FULL_COVERAGE,
    deductible: 500,
    selectedScenario: ScenarioType.MINOR_ACCIDENT,
    ...overrides,
  });

  // Standard trade-off: a low deductible (pricier) vs a high deductible (cheaper).
  const lowDeductible = config({ deductible: 250 });
  const highDeductible = config({ deductible: 2000 });

  describe('Infinity cases', () => {
    it('returns Infinity for two identical configs', () => {
      expect(calculateBreakEven(config(), config())).toBe(Infinity);
    });
    it('returns Infinity when premiums are equal but scenarios differ', () => {
      const a = config({ selectedScenario: ScenarioType.MINOR_ACCIDENT });
      const b = config({ selectedScenario: ScenarioType.THEFT });
      expect(calculateBreakEven(a, b)).toBe(Infinity);
    });
    it('returns Infinity when premiums differ but out-of-pocket is identical', () => {
      // Same coverage/deductible/scenario, different vehicle value -> different
      // premium but the same deductible-based out-of-pocket.
      const a = config({ vehicleValue: 20000 });
      const b = config({ vehicleValue: 30000 });
      expect(calculateBreakEven(a, b)).toBe(Infinity);
    });
    it('returns Infinity when the cheaper policy also has lower out-of-pocket', () => {
      // Liability only is cheaper AND pays 0 for a collision (uncovered),
      // so the pricier full-coverage policy never pays for itself.
      const cheapDominant = config({ coverageType: CoverageType.LIABILITY_ONLY });
      const pricier = config({ coverageType: CoverageType.FULL_COVERAGE });
      expect(calculateBreakEven(cheapDominant, pricier)).toBe(Infinity);
    });
  });

  describe('valid comparison cases', () => {
    it('computes the break-even years for a deductible trade-off', () => {
      // saving = 1580 - 1440 = 140/yr; extra out-of-pocket = 2000 - 250 = 1750
      // 1750 / 140 = 12.5 -> rounds up to 13
      expect(calculateBreakEven(lowDeductible, highDeductible)).toBe(13);
    });
    it('returns a positive integer', () => {
      const result = calculateBreakEven(lowDeductible, highDeductible);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });
    it('returns a finite number for a valid trade-off', () => {
      expect(Number.isFinite(calculateBreakEven(lowDeductible, highDeductible))).toBe(true);
    });
    it('is symmetric regardless of argument order', () => {
      expect(calculateBreakEven(lowDeductible, highDeductible)).toBe(
        calculateBreakEven(highDeductible, lowDeductible),
      );
    });
    it('rounds up: 1750 / 280 = 6.25 -> 7', () => {
      // Doubling vehicle value doubles the premium gap (280/yr) but leaves the
      // deductible-based out-of-pocket gap unchanged (1750).
      const low = config({ vehicleValue: 40000, deductible: 250 });
      const high = config({ vehicleValue: 40000, deductible: 2000 });
      expect(calculateBreakEven(low, high)).toBe(7);
    });
    it('needs fewer years when the premium gap is larger', () => {
      const smallGap = calculateBreakEven(lowDeductible, highDeductible); // 13
      const bigGap = calculateBreakEven(
        config({ vehicleValue: 40000, deductible: 250 }),
        config({ vehicleValue: 40000, deductible: 2000 }),
      ); // 7
      expect(bigGap).toBeLessThan(smallGap);
    });
    it('produces a positive integer for a total-loss comparison', () => {
      const low = config({ deductible: 250, selectedScenario: ScenarioType.TOTAL_LOSS });
      const high = config({ deductible: 2000, selectedScenario: ScenarioType.TOTAL_LOSS });
      const result = calculateBreakEven(low, high);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
      expect(Number.isFinite(result)).toBe(true);
    });
  });
});

describe("calculateCoveragePayout", () => {
  const config = (overrides: Partial<PolicyConfig> = {}): PolicyConfig => ({
    vehicleValue: 20000,
    coverageType: CoverageType.FULL_COVERAGE,
    deductible: 500,
    selectedScenario: ScenarioType.MINOR_ACCIDENT,
    ...overrides,
  });

  it("pays nothing for an uncovered scenario", () => {
    const c = config({ coverageType: CoverageType.LIABILITY_ONLY });
    expect(calculateCoveragePayout(c, ScenarioType.MINOR_ACCIDENT)).toBe(0);
  });

  it("pays vehicle value minus deductible for a covered total loss", () => {
    expect(calculateCoveragePayout(config(), ScenarioType.TOTAL_LOSS)).toBe(
      19500,
    );
  });

  it("pays vehicle value minus deductible for a covered theft", () => {
    expect(calculateCoveragePayout(config(), ScenarioType.THEFT)).toBe(19500);
  });

  it("floors the payout at 0 when the deductible exceeds the vehicle value", () => {
    const c = config({ vehicleValue: 1000, deductible: 3000 });
    expect(calculateCoveragePayout(c, ScenarioType.TOTAL_LOSS)).toBe(0);
  });

  it("out-of-pocket plus payout equals vehicle value for covered scenarios", () => {
    const c = config({ deductible: 750 });
    const oop = calculateOutOfPocket(c, ScenarioType.MINOR_ACCIDENT);
    const payout = calculateCoveragePayout(c, ScenarioType.MINOR_ACCIDENT);
    expect(oop + payout).toBe(c.vehicleValue);
  });

  it("the invariant holds even when the deductible exceeds the vehicle value", () => {
    const c = config({ vehicleValue: 1000, deductible: 3000 });
    const oop = calculateOutOfPocket(c, ScenarioType.TOTAL_LOSS);
    const payout = calculateCoveragePayout(c, ScenarioType.TOTAL_LOSS);
    expect(oop + payout).toBe(c.vehicleValue);
  });
});

describe("isScenarioCovered", () => {
  it("liability only covers uninsured motorist but not own-vehicle damage", () => {
    expect(
      isScenarioCovered(CoverageType.LIABILITY_ONLY, ScenarioType.UNINSURED_MOTORIST),
    ).toBe(true);
    expect(
      isScenarioCovered(CoverageType.LIABILITY_ONLY, ScenarioType.MINOR_ACCIDENT),
    ).toBe(false);
  });

  it("comprehensive covers theft but not a collision", () => {
    expect(
      isScenarioCovered(CoverageType.COMPREHENSIVE, ScenarioType.THEFT),
    ).toBe(true);
    expect(
      isScenarioCovered(CoverageType.COMPREHENSIVE, ScenarioType.MINOR_ACCIDENT),
    ).toBe(false);
  });

  it("full coverage covers a minor accident", () => {
    expect(
      isScenarioCovered(CoverageType.FULL_COVERAGE, ScenarioType.MINOR_ACCIDENT),
    ).toBe(true);
  });
});