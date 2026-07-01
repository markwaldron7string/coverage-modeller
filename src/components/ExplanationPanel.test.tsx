/** @jest-environment jsdom */
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ExplanationPanel } from "./ExplanationPanel";
import { useScenarioStore, DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";

beforeEach(() => {
  useScenarioStore.setState({
    policyA: { ...DEFAULT_POLICY_A },
    policyB: { ...DEFAULT_POLICY_B },
  });
});

describe("ExplanationPanel", () => {
  it("renders an explanation reflecting the default policy", () => {
    render(<ExplanationPanel policy="policyA" />);
    expect(screen.getByText(/\$20,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$1,000/)).toBeInTheDocument();
    expect(screen.getByText(/liability coverage/i)).toBeInTheDocument();
  });

  it("updates when a coverage toggle changes", () => {
    render(<ExplanationPanel policy="policyA" />);
    act(() => {
      useScenarioStore.getState().setComprehensive("policyA", false);
      useScenarioStore.getState().setCollision("policyA", false);
    });
    expect(screen.getByText(/wouldn't be covered/i)).toBeInTheDocument();
  });

  it("does not mention 'Full Coverage' anywhere", () => {
    render(<ExplanationPanel policy="policyA" />);
    expect(screen.queryByText(/full coverage/i)).not.toBeInTheDocument();
  });
});