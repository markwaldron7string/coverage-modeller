/** @jest-environment jsdom */
import React from "react";
import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  ComparisonChart,
  buildComparisonChartData,
} from "./ComparisonChart";
import { useScenarioStore } from "@/store/scenarioStore";
import { CoverageType, ScenarioType, PolicyConfig } from "@/types";

// Give ResponsiveContainer real dimensions so the SVG (legend, axes) renders.
jest.mock("recharts", () => {
  const Original = jest.requireActual("recharts");
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(
        children as React.ReactElement<{ width?: number; height?: number }>,
        { width: 800, height: 400 },
      ),
  };
});

const initialState = useScenarioStore.getState();

const policy = (overrides: Partial<PolicyConfig> = {}): PolicyConfig => ({
  vehicleValue: 20000,
  coverageType: CoverageType.FULL_COVERAGE,
  deductible: 500,
  selectedScenario: ScenarioType.MINOR_ACCIDENT,
  ...overrides,
});

describe("buildComparisonChartData", () => {
  it("returns one row per scenario", () => {
    const rows = buildComparisonChartData(policy(), policy());
    expect(rows).toHaveLength(5);
  });

  it("computes out-of-pocket for both policies across every scenario", () => {
    const a = policy({ deductible: 500 });
    const b = policy({ deductible: 1500 });
    const rows = buildComparisonChartData(a, b);
    const minorAccident = rows.find((r) => r.scenario === "Minor accident")!;
    expect(minorAccident["Policy A"]).toBe(500);
    expect(minorAccident["Policy B"]).toBe(1500);
  });

  it("reflects coverage gaps as $0 for uncovered scenarios", () => {
    const a = policy({ coverageType: CoverageType.LIABILITY_ONLY });
    const b = policy();
    const rows = buildComparisonChartData(a, b);
    const minorAccident = rows.find((r) => r.scenario === "Minor accident")!;
    expect(minorAccident["Policy A"]).toBe(0); // liability doesn't cover collision
    expect(minorAccident["Policy B"]).toBe(500);
  });
});

describe("ComparisonChart", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
  });

  it("renders an accessible chart title", () => {
    render(<ComparisonChart />);
    expect(
      screen.getByRole("group", { name: /out-of-pocket cost by scenario/i }),
    ).toBeInTheDocument();
  });

  it("renders a legend identifying both policies", () => {
    const { container } = render(<ComparisonChart />);
    const legend = container.querySelector(".recharts-legend-wrapper");
    expect(legend).not.toBeNull();
    expect(legend).toHaveTextContent("Policy A");
    expect(legend).toHaveTextContent("Policy B");
  });

  it("provides an accessible data table covering all five scenarios", () => {
    render(<ComparisonChart />);
    const table = screen.getByRole("table", { name: /out-of-pocket cost by scenario/i });
    // 5 scenario rows + 1 header row
    expect(within(table).getAllByRole("row")).toHaveLength(6);
  });

  it("updates when a policy slice changes", () => {
    render(<ComparisonChart />);
    const table = screen.getByRole("table", { name: /out-of-pocket cost by scenario/i });
    // Policy A default deductible is $1,000; full coverage covers all 5 scenarios.
    expect(within(table).getAllByText("$1,000")).toHaveLength(5);
    act(() => {
      useScenarioStore.getState().setDeductible("policyA", 750);
    });
    expect(within(table).getAllByText("$750")).toHaveLength(5);
  });
});