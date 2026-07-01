import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ControlsPanel } from "./ControlsPanel";
import { useScenarioStore, DEFAULT_POLICY_A, DEFAULT_POLICY_B } from "@/store/scenarioStore";

beforeEach(() => {
  useScenarioStore.setState({
    policyA: { ...DEFAULT_POLICY_A },
    policyB: { ...DEFAULT_POLICY_B },
  });
});

describe("ControlsPanel — composable coverage checkboxes", () => {
  it("renders three independent, checked-by-default checkboxes and a static liability note", () => {
    render(<ControlsPanel policy="policyA" />);
    expect(screen.getByText(/liability coverage is included/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /comprehensive/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /^collision/i })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /uninsured\/underinsured motorist/i })).toBeChecked();
  });

  it("toggling one coverage doesn't affect the others", () => {
    render(<ControlsPanel policy="policyA" />);
    fireEvent.click(screen.getByRole("checkbox", { name: /comprehensive/i }));
    expect(useScenarioStore.getState().policyA.comprehensive).toBe(false);
    expect(useScenarioStore.getState().policyA.collision).toBe(true);
    expect(useScenarioStore.getState().policyA.uninsuredMotorist).toBe(true);
  });

  it("does not render 'Full Coverage' anywhere", () => {
    render(<ControlsPanel policy="policyA" />);
    expect(screen.queryByText(/full coverage/i)).not.toBeInTheDocument();
  });
});

describe("AC1/AC5 — vehicle value validation", () => {
  it("shows a message below the minimum and links it via aria-describedby", () => {
    useScenarioStore.setState({ policyA: { ...DEFAULT_POLICY_A, vehicleValue: 500 } });
    render(<ControlsPanel policy="policyA" />);
    const msg = screen.getByText(/at least \$1,000/i);
    const input = screen.getByLabelText(/vehicle value/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", msg.id);
  });

  it("shows no message for an in-range value", () => {
    render(<ControlsPanel policy="policyA" />);
    expect(screen.queryByText(/at least|at most/i)).not.toBeInTheDocument();
  });
});

describe("AC2 — claim scenario can be cleared", () => {
  it("offers a placeholder option and sets null when chosen", () => {
    render(<ControlsPanel policy="policyA" />);
    expect(screen.getByRole("option", { name: /select a scenario/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/claim scenario/i), { target: { value: "" } });
    expect(useScenarioStore.getState().policyA.selectedScenario).toBeNull();
  });
});