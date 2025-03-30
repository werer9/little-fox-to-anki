import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom/vitest";
import { getConfig } from "@/config.ts";

// Mock child components to isolate tests for App component
vi.mock("@/components/ui/checkbox.tsx", () => ({
  Checkbox: vi.fn(({ id, onCheckedChange }) => (
    <input
      type="checkbox"
      id={id}
      data-testid="checkbox"
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  )),
}));

vi.mock("@/components/SendToAnkiButton.tsx", () => ({
  default: vi.fn(({ isSelected }) => (
    <button data-testid="send-to-anki" data-selected={isSelected}>
      Send to Anki
    </button>
  )),
}));

vi.mock("@/components/CreateAPKGButton.tsx", () => ({
  default: vi.fn(() => <button data-testid="create-apkg">Create APKG</button>),
}));

// In your test file
vi.mock("@/config", () => ({
  getConfig: vi.fn(() => ({ createApkgEnabled: false })),
}));

describe("App Component", () => {
  const renderApp = () => {
    return render(<App />);
  };

  it("renders without crashing", () => {
    renderApp();
    expect(
      screen.getByText("Only export selected vocabulary"),
    ).toBeInTheDocument();
  });

  it("renders the checkbox with correct label", () => {
    renderApp();
    const checkbox = screen.getByTestId("checkbox");
    const label = screen.getByText("Only export selected vocabulary");

    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "exportSelected");
  });

  it("toggles the isSelected state when checkbox is clicked", () => {
    renderApp();
    const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;

    // Initial state should be false (unchecked)
    expect(checkbox.checked).toBe(false);

    // Click the checkbox
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    // Click again to toggle off
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it("renders the SendToAnkiButton with correct props", () => {
    renderApp();
    const sendButton = screen.getByTestId("send-to-anki");

    expect(sendButton).toBeInTheDocument();
    expect(sendButton).toHaveAttribute("data-selected", "false");

    // Toggle checkbox and verify prop change
    fireEvent.click(screen.getByTestId("checkbox"));
    expect(sendButton).toHaveAttribute("data-selected", "true");
  });

  describe("when CREATE_APKG_ENABLED is true", () => {
    it("renders the CreateAPKGButton", () => {
      // Temporarily set the env variable
      vi.mocked(getConfig).mockReturnValueOnce({ createApkgEnabled: true });

      renderApp();
      expect(screen.getByTestId("create-apkg")).toBeInTheDocument();
    });
  });

  describe("when CREATE_APKG_ENABLED is false", () => {
    it("does not render the CreateAPKGButton", () => {
      vi.mocked(getConfig).mockReturnValueOnce({ createApkgEnabled: false });

      renderApp();
      expect(screen.queryByTestId("create-apkg")).not.toBeInTheDocument();
    });
  });

  it("uses dark theme by default", () => {
    renderApp();
    // You might need to adjust this based on how your theme is applied
    expect(document.documentElement).toHaveClass("dark");
  });
});
