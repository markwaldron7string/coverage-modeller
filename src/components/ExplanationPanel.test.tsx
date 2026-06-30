/** @jest-environment jsdom */
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ExplanationPanel } from "./ExplanationPanel";
import { useScenarioStore } from "@/store/scenarioStore";
import { CoverageType } from "@/types";

const initialState = useScenarioStore.getState();

describe("ExplanationPanel", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
  });

  it("renders an explanation reflecting the default policy", () => {
    render(<ExplanationPanel policy="policyA" />);
    expect(screen.getByText(/full coverage/i)).toBeInTheDocument();
    expect(screen.getByText(/\$20,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$1,000/)).toBeInTheDocument();
  });

  it("updates when the coverage type changes", () => {
    render(<ExplanationPanel policy="policyA" />);
    act(() => {
      useScenarioStore
        .getState()
        .setCoverageType("policyA", CoverageType.LIABILITY_ONLY);
    });
    expect(screen.getByText(/liability-only/i)).toBeInTheDocument();
  });

  it("updates when the deductible changes", () => {
    render(<ExplanationPanel policy="policyA" />);
    act(() => {
      useScenarioStore.getState().setDeductible("policyA", 500);
    });
    expect(screen.getByText(/\$500/)).toBeInTheDocument();
  });

  it("is a labelled region, distinct from the results panel", () => {
    render(<ExplanationPanel policy="policyA" />);
    expect(
      screen.getByRole("region", { name: /in plain english/i }),
    ).toBeInTheDocument();
  });
});
