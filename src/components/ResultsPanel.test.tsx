import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ResultsPanel } from "./ResultsPanel";
import {
  useScenarioStore,
  DEFAULT_POLICY_A,
  DEFAULT_POLICY_B,
} from "@/store/scenarioStore";
import { CoverageType, ScenarioType } from "@/types";

beforeEach(() => {
  useScenarioStore.setState({
    policyA: { ...DEFAULT_POLICY_A },
    policyB: { ...DEFAULT_POLICY_B },
  });
});

describe("ResultsPanel — covered scenario", () => {
  it("shows out-of-pocket, payout, and premium for a covered claim", () => {
    // default policyA: $20,000 / full coverage / $1,000 / minor accident
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/estimated out-of-pocket cost/i)).toBeInTheDocument();
    expect(screen.getByText("$1,000")).toBeInTheDocument(); // min(1000, 20000)
    expect(screen.getByText(/coverage payout/i)).toBeInTheDocument();
    expect(screen.getByText("$19,000")).toBeInTheDocument(); // 20000 - 1000
    expect(screen.getByText(/annual premium estimate/i)).toBeInTheDocument();
    expect(screen.getByText("$1,520")).toBeInTheDocument(); // 20000*.04*2*.95
  });
});

describe("ResultsPanel — not covered scenario", () => {
  it("shows the 'Not covered' note and hides the cost metrics", () => {
    useScenarioStore.setState({
      policyA: {
        ...DEFAULT_POLICY_A,
        coverageType: CoverageType.LIABILITY_ONLY,
        selectedScenario: ScenarioType.MINOR_ACCIDENT,
      },
    });
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/not covered/i)).toBeInTheDocument();
    expect(screen.queryByText(/coverage payout/i)).not.toBeInTheDocument();
    // premium is scenario-independent, so it still shows
    expect(screen.getByText(/annual premium estimate/i)).toBeInTheDocument();
  });
});

describe("ResultsPanel — break-even (comparison mode)", () => {
  it("shows the break-even metric only when a comparison config is provided", () => {
    const { rerender } = render(<ResultsPanel policy="policyA" />);
    expect(
      screen.queryByText(/break-even vs\. comparison/i),
    ).not.toBeInTheDocument();

    rerender(
      <ResultsPanel policy="policyA" comparisonConfig={DEFAULT_POLICY_B} />,
    );
    expect(
      screen.getByText(/break-even vs\. comparison/i),
    ).toBeInTheDocument();
  });
});

describe("AC2 — results panel with no scenario selected", () => {
  it("shows a clear prompt instead of zeroed metrics", () => {
    useScenarioStore.setState({
      policyA: { ...DEFAULT_POLICY_A, selectedScenario: null },
    });
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/select a claim scenario/i)).toBeInTheDocument();
    expect(screen.queryByText(/coverage payout/i)).not.toBeInTheDocument();
  });

  it("shows metrics (and does not crash) for a selected scenario", () => {
    render(<ResultsPanel policy="policyA" />);
    expect(
      screen.getByText(/estimated out-of-pocket cost/i),
    ).toBeInTheDocument();
  });
});