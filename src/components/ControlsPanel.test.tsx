/** @jest-environment jsdom */
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ControlsPanel } from "./ControlsPanel";
import { useScenarioStore } from "@/store/scenarioStore";
import { CoverageType, ScenarioType } from "@/types";

const initialState = useScenarioStore.getState();

describe("ControlsPanel", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
    render(<ControlsPanel policy="policyA" />);
  });

  it("renders the vehicle value as a labelled number input with the right constraints", () => {
    const input = screen.getByLabelText(/vehicle value/i);
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1000");
    expect(input).toHaveAttribute("max", "150000");
    expect(input).toHaveAttribute("step", "1000");
  });

  it("updates the store when the vehicle value changes", () => {
    fireEvent.change(screen.getByLabelText(/vehicle value/i), {
      target: { value: "45000" },
    });
    expect(useScenarioStore.getState().policyA.vehicleValue).toBe(45000);
  });

  it("renders a radio for each coverage type with plain-language labels", () => {
    expect(screen.getByRole("radio", { name: /liability only/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /comprehensive/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /full coverage/i })).toBeInTheDocument();
  });

  it("updates the store when a coverage type is selected", () => {
    fireEvent.click(screen.getByRole("radio", { name: /liability only/i }));
    expect(useScenarioStore.getState().policyA.coverageType).toBe(
      CoverageType.LIABILITY_ONLY,
    );
  });

  it("renders the deductible as a labelled range slider with the right constraints", () => {
    const slider = screen.getByLabelText(/deductible/i);
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "250");
    expect(slider).toHaveAttribute("max", "3000");
    expect(slider).toHaveAttribute("step", "250");
  });

  it("updates the store and the live display when the deductible changes", () => {
    fireEvent.change(screen.getByLabelText(/deductible/i), {
      target: { value: "1500" },
    });
    expect(useScenarioStore.getState().policyA.deductible).toBe(1500);
    expect(screen.getByText("$1,500")).toBeInTheDocument();
  });

  it("renders the scenario dropdown with all five scenarios", () => {
    const select = screen.getByLabelText(/scenario/i);
    expect(within(select).getAllByRole("option")).toHaveLength(5);
  });

  it("updates the store when a scenario is selected", () => {
    fireEvent.change(screen.getByLabelText(/scenario/i), {
      target: { value: ScenarioType.THEFT },
    });
    expect(useScenarioStore.getState().policyA.selectedScenario).toBe(
      ScenarioType.THEFT,
    );
  });

  it("reflects the store's default values on render", () => {
    expect(screen.getByLabelText(/vehicle value/i)).toHaveValue(20000);
    expect(screen.getByRole("radio", { name: /full coverage/i })).toBeChecked();
    expect(screen.getByText("$1,000")).toBeInTheDocument();
  });
});

describe("ControlsPanel (policy targeting)", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
  });

  it("writes to policy B without touching policy A", () => {
    render(<ControlsPanel policy="policyB" heading="Policy B" />);
    fireEvent.change(screen.getByLabelText(/vehicle value/i), {
      target: { value: "60000" },
    });
    expect(useScenarioStore.getState().policyB.vehicleValue).toBe(60000);
    expect(useScenarioStore.getState().policyA.vehicleValue).toBe(20000);
  });

  it("renders the provided heading", () => {
    render(<ControlsPanel policy="policyB" heading="Policy B" />);
    expect(
      screen.getByRole("heading", { name: /policy b/i }),
    ).toBeInTheDocument();
  });
});