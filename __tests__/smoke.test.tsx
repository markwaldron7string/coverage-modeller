import { render, screen } from "@testing-library/react";

it("renders and queries the DOM", () => {
  render(<h1>Coverage Modeller</h1>);
  expect(
    screen.getByRole("heading", { name: /coverage modeller/i })
  ).toBeInTheDocument();
});