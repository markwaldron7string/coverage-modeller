/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "./page";
import { useScenarioStore } from "@/store/scenarioStore";

const initialState = useScenarioStore.getState();

describe("Home (modeller layout)", () => {
  beforeEach(() => {
    useScenarioStore.setState(initialState, true);
    render(<Home />);
  });

  it("renders a main landmark", () => {
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a page banner with a single h1", () => {
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /coverage modeller/i }),
    ).toBeInTheDocument();
  });

  it("renders the controls section and the results complementary panel", () => {
    expect(
      screen.getByRole("heading", { level: 2, name: /configure your policy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /your estimate/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });
});
