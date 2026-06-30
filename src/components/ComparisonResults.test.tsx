/** @jest-environment jsdom */
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ComparisonResults } from "./ComparisonResults";
import { useScenarioStore } from "@/store/scenarioStore";
import { CoverageType, ScenarioType } from "@/types";

const initialState = useScenarioStore.getState();

beforeEach(() => {
  useScenarioStore.setState(initialState, true);
});

describe("ComparisonResults", () => {
  // Defaults: A = $1,000 deductible, B = $2,000 deductible (both full, $20k, minor accident)
  // premium A = $1,520, premium B = $1,440  -> A higher cost, B lower
  // oop A = $1,000, oop B = $2,000          -> A lower cost, B higher
  // break-even = 13 years

  it("renders both policies' premiums", () => {
    render(<ComparisonResults />);
    expect(screen.getByText("$1,520")).toBeInTheDocument();
    expect(screen.getByText("$1,440")).toBeInTheDocument();
  });

  it("flags the higher and lower cost figures for screen readers", () => {
    render(<ComparisonResults />);
    // Two cost rows (out-of-pocket and premium), each with one higher and one lower.
    expect(screen.getAllByText(/higher cost/i)).toHaveLength(2);
    expect(screen.getAllByText(/lower cost/i)).toHaveLength(2);
  });

  it("shows the break-even result", () => {
    render(<ComparisonResults />);
    expect(screen.getByText(/break-even/i)).toBeInTheDocument();
    expect(screen.getByText(/13 years/i)).toBeInTheDocument();
  });

  it("uses a real table with column headers for the two policies", () => {
    render(<ComparisonResults />);
    expect(
      screen.getByRole("columnheader", { name: /policy a/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /policy b/i }),
    ).toBeInTheDocument();
  });

  it("shows 'Not covered' for a policy whose scenario is uncovered", () => {
    act(() => {
      useScenarioStore
        .getState()
        .setCoverageType("policyB", CoverageType.LIABILITY_ONLY);
      useScenarioStore
        .getState()
        .setScenario("policyB", ScenarioType.MINOR_ACCIDENT);
    });
    render(<ComparisonResults />);
    expect(screen.getByText(/not covered/i)).toBeInTheDocument();
  });

  it("updates when a policy slice changes", () => {
    render(<ComparisonResults />);
    act(() => {
      useScenarioStore.getState().setVehicleValue("policyA", 40000);
    });
    // premium A doubles: 1520 -> 3040
    expect(screen.getByText("$3,040")).toBeInTheDocument();
  });
});
