import { expect, test } from "vitest";
import App from "../src/App";
import { render, screen } from "@testing-library/react";

test("renders checkbox and button", () => {
  render(<App />);
  expect(screen.getByText("Only export selected vocabulary")).toBeDefined();
  expect(screen.getByText("Send to Anki")).toBeDefined();
  expect(screen.queryByText("Export to Anki Deck File")).toBeNull();
});
