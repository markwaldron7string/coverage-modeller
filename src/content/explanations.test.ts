import { buildExplanation } from "./explanations";
import { PolicyConfig, ScenarioType } from "@/types";

const cfg = (o: Partial<PolicyConfig> = {}): PolicyConfig => ({
  vehicleValue: 20000,
  comprehensive: false,
  collision: false,
  uninsuredMotorist: false,
  deductible: 1000,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
  ...o,
});

describe("buildExplanation content", () => {
  it("always mentions liability", () => {
    expect(buildExplanation(cfg())).toMatch(/liability/i);
  });
  it("mentions comprehensive only when active", () => {
    expect(buildExplanation(cfg({ comprehensive: true }))).toMatch(/added comprehensive coverage/i);
    expect(buildExplanation(cfg({ comprehensive: false }))).not.toMatch(/added comprehensive coverage/i);
  });
  it("mentions collision only when active", () => {
    expect(buildExplanation(cfg({ collision: true }))).toMatch(/collision coverage/i);
  });
  it("mentions uninsured motorist only when active", () => {
    expect(buildExplanation(cfg({ uninsuredMotorist: true }))).toMatch(/uninsured\/underinsured motorist/i);
    expect(buildExplanation(cfg({ uninsuredMotorist: false }))).not.toMatch(/uninsured\/underinsured motorist/i);
  });
  it("notes own-vehicle damage isn't covered when neither comp nor collision is active", () => {
    expect(buildExplanation(cfg())).toMatch(/wouldn't be covered/i);
  });
  it("always mentions the vehicle value, regardless of which coverages are active", () => {
    expect(buildExplanation(cfg({ vehicleValue: 35000 }))).toMatch(/\$35,000/); // no comp/collision
    expect(
      buildExplanation(cfg({ vehicleValue: 35000, comprehensive: true, collision: true })),
    ).toMatch(/\$35,000/); // WAS missing before this fix
  });
  it("fills in the deductible when a coverage that uses it is active", () => {
    const text = buildExplanation(cfg({ deductible: 750, collision: true }));
    expect(text).toMatch(/\$750/);
  });
});

describe("grammatical sweep — every combination of the 3 toggles is clean prose", () => {
  const bools = [true, false];
  const combos: PolicyConfig[] = [];
  for (const comprehensive of bools)
    for (const collision of bools)
      for (const uninsuredMotorist of bools)
        combos.push(cfg({ comprehensive, collision, uninsuredMotorist }));

  it.each(combos)("combo %#: no NaN/undefined, no double spaces, sentence-cased", (config) => {
    const text = buildExplanation(config);
    expect(text).not.toMatch(/undefined|NaN/);
    expect(text).not.toMatch(/ {2,}/);
    expect(text).toMatch(/^[A-Z].*\.$/s);
  });
});