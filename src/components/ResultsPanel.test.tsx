import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ResultsPanel } from "./ResultsPanel";
import {
  useScenarioStore,
  DEFAULT_POLICY_A,
  DEFAULT_POLICY_B,
} from "@/store/scenarioStore";

describe("AC2 — results panel with no scenario selected", () => {
  beforeEach(() => {
    useScenarioStore.setState({
      policyA: { ...DEFAULT_POLICY_A },
      policyB: { ...DEFAULT_POLICY_B },
    });
  });

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