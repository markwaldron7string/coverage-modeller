/** @jest-environment jsdom */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CopyLinkButton } from "./CopyLinkButton";

describe("CopyLinkButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    window.history.replaceState(null, "", "/?av=30000");
  });

  it("is visible with a copy label", () => {
    render(<CopyLinkButton />);
    expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
  });

  it("copies the current URL to the clipboard and confirms", async () => {
    render(<CopyLinkButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      window.location.href,
    );
    await waitFor(() =>
      expect(screen.getByText(/copied!/i)).toBeInTheDocument(),
    );
  });
});