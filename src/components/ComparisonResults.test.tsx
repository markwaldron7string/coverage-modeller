import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ComparisonResults } from "./ComparisonResults";
import { useScenarioStore, DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";

beforeEach(() => {
  useScenarioStore.setState({
    policyA: { ...DEFAULT_POLICY_A },
    policyB: { ...DEFAULT_POLICY_B },
  });
});

describe("ComparisonResults — coverage composition", () => {
  it("shows figures for both policies when the scenario is covered", () => {
    render(<ComparisonResults />);
    expect(screen.getAllByText(/\$1,000|\$2,000/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/not covered/i)).not.toBeInTheDocument();
  });

  it("shows 'Not covered' for a policy missing the needed coverage", () => {
    useScenarioStore.setState({ policyA: { ...DEFAULT_POLICY_A, collision: false } });
    render(<ComparisonResults />);
    expect(screen.getByText(/not covered/i)).toBeInTheDocument();
  });
});