/** @jest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ModellerWorkspace } from "./ModellerWorkspace";
import { useScenarioStore } from "@/store/scenarioStore";

const initialState = useScenarioStore.getState();

describe("ModellerWorkspace", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
    render(<ModellerWorkspace />);
  });

  it("starts in single-policy mode", () => {
    expect(
      screen.getByRole("heading", { name: /configure your policy/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /side-by-side comparison/i }),
    ).not.toBeInTheDocument();
  });

  it("exposes the view toggle with pressed state", () => {
    const single = screen.getByRole("button", { name: /single policy/i });
    const compare = screen.getByRole("button", { name: /compare two/i });
    expect(single).toHaveAttribute("aria-pressed", "true");
    expect(compare).toHaveAttribute("aria-pressed", "false");
  });

  it("switches to comparison mode showing two policy panels and the comparison table", () => {
    fireEvent.click(screen.getByRole("button", { name: /compare two/i }));
    expect(
      screen.getByRole("heading", { name: /policy a/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /policy b/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /side-by-side comparison/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /compare two/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("switches back to single mode", () => {
    fireEvent.click(screen.getByRole("button", { name: /compare two/i }));
    fireEvent.click(screen.getByRole("button", { name: /single policy/i }));
    expect(
      screen.getByRole("heading", { name: /configure your policy/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /side-by-side comparison/i }),
    ).not.toBeInTheDocument();
  });
});
