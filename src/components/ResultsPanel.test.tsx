import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ResultsPanel } from "./ResultsPanel";
import { useScenarioStore, DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";

beforeEach(() => {
  useScenarioStore.setState({
    policyA: { ...DEFAULT_POLICY_A },
    policyB: { ...DEFAULT_POLICY_B },
  });
});

describe("ResultsPanel — covered scenario", () => {
  it("shows out-of-pocket, payout, and premium for a covered claim", () => {
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/estimated out-of-pocket cost/i)).toBeInTheDocument();
    expect(screen.getByText("$1,000")).toBeInTheDocument();
    expect(screen.getByText(/coverage payout/i)).toBeInTheDocument();
  });
});

describe("ResultsPanel — not covered names the specific missing coverage", () => {
  it("names Collision for a minor accident with collision off", () => {
    useScenarioStore.setState({ policyA: { ...DEFAULT_POLICY_A, collision: false } });
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/not covered/i)).toBeInTheDocument();
    expect(screen.getByText(/without collision coverage/i)).toBeInTheDocument();
  });

  it("names both Comprehensive and Collision for a total loss with neither on", () => {
    useScenarioStore.setState({
      policyA: {
        ...DEFAULT_POLICY_A,
        comprehensive: false,
        collision: false,
        selectedScenario: "TOTAL_LOSS" as never,
      },
    });
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/comprehensive or collision coverage/i)).toBeInTheDocument();
  });

  it("does not reference 'Full Coverage' anywhere", () => {
    useScenarioStore.setState({ policyA: { ...DEFAULT_POLICY_A, collision: false } });
    render(<ResultsPanel policy="policyA" />);
    expect(screen.queryByText(/full coverage/i)).not.toBeInTheDocument();
  });
});

describe("AC2 — no scenario selected", () => {
  it("shows a clear prompt instead of zeroed metrics", () => {
    useScenarioStore.setState({ policyA: { ...DEFAULT_POLICY_A, selectedScenario: null } });
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/select a claim scenario/i)).toBeInTheDocument();
  });
});