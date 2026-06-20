/** @jest-environment jsdom */
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ResultsPanel } from "./ResultsPanel";
import { useScenarioStore } from "@/store/scenarioStore";
import { CoverageType, ScenarioType, PolicyConfig } from "@/types";

const initialState = useScenarioStore.getState();

beforeEach(() => {
  useScenarioStore.setState(initialState, true);
});

describe("ResultsPanel (single-panel mode)", () => {
  // Policy A defaults: $20,000, full coverage, $1,000 deductible, minor accident.
  // out-of-pocket = $1,000; payout = $19,000; premium = 20000*0.04*2*0.95 = $1,520

  it("displays out-of-pocket, payout, and premium for a covered scenario", () => {
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText("$1,000")).toBeInTheDocument();
    expect(screen.getByText("$19,000")).toBeInTheDocument();
    expect(screen.getByText("$1,520")).toBeInTheDocument();
  });

  it("hides the break-even section in single-panel mode", () => {
    render(<ResultsPanel policy="policyA" />);
    expect(screen.queryByText(/break-even/i)).not.toBeInTheDocument();
  });

  it("updates the displayed values when the store changes, no reload", () => {
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText("$1,000")).toBeInTheDocument();
    act(() => {
      useScenarioStore.getState().setDeductible("policyA", 2000);
    });
    expect(screen.getByText("$2,000")).toBeInTheDocument();
    expect(screen.getByText("$18,000")).toBeInTheDocument();
  });

  it("shows a descriptive message for an uncovered scenario instead of zeros", () => {
    act(() => {
      useScenarioStore.getState().setCoverageType("policyA", CoverageType.LIABILITY_ONLY);
      useScenarioStore.getState().setScenario("policyA", ScenarioType.MINOR_ACCIDENT);
    });
    render(<ResultsPanel policy="policyA" />);
    expect(screen.getByText(/not covered/i)).toBeInTheDocument();
    expect(screen.getByText(/pay the full cost yourself/i)).toBeInTheDocument();
    // liability premium = 20000*0.04*1.0*0.95 = $760
    expect(screen.getByText("$760")).toBeInTheDocument();
    expect(screen.queryByText(/out-of-pocket/i)).not.toBeInTheDocument();
  });

  it("exposes an ARIA live region so updates are announced", () => {
    const { container } = render(<ResultsPanel policy="policyA" />);
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});

describe("ResultsPanel (comparison mode)", () => {
  it("shows the break-even years when a comparison config is provided", () => {
    // Primary (policy A default): premium $1,520, oop $1,000
    // Comparison: $250 deductible -> premium $1,580, oop $250
    // saving $60/yr; extra oop $750; 750/60 = 12.5 -> 13 years
    const comparisonConfig: PolicyConfig = {
      vehicleValue: 20000,
      coverageType: CoverageType.FULL_COVERAGE,
      deductible: 250,
      selectedScenario: ScenarioType.MINOR_ACCIDENT,
    };
    render(<ResultsPanel policy="policyA" comparisonConfig={comparisonConfig} />);
    expect(screen.getByText(/break-even/i)).toBeInTheDocument();
    expect(screen.getByText("13 years")).toBeInTheDocument();
  });
});