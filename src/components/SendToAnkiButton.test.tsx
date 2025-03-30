import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SendToAnkiButton from "@/components/SendToAnkiButton";
import "@testing-library/jest-dom/vitest";
import { vi, it, describe, beforeEach, expect } from "vitest";
import exportAnkiCards from "@/lib/export-anki-cards.ts";

// Mock the browser API
vi.mock("webextension-polyfill", () => ({
  default: {
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
  },
}));

// Mock the exportAnkiCards function
vi.mock("@/lib/export-anki-cards", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe("SendToAnkiButton", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    vi.mock("yanki-connect", () => ({
      YankiConnect: vi.fn().mockImplementation(() => ({
        deck: {
          deckNames: vi.fn().mockResolvedValue(["Default"]),
        },
      })),
    }));

    // Setup default mock implementations
    browser.tabs.query = vi.fn().mockResolvedValue([{ id: 123 }]);
    browser.tabs.sendMessage = vi.fn().mockResolvedValue([]);
  });

  it("renders correctly when not loading", () => {
    render(<SendToAnkiButton isSelected={false} />);
    expect(screen.getByText("Send to Anki")).toBeInTheDocument();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("filters selected items when isSelected is true", async () => {
    vi.mock("yanki-connect", () => ({
      YankiConnect: vi.fn().mockImplementation(() => ({
        deck: {
          deckNames: vi.fn().mockResolvedValue(["Default"]),
        },
      })),
    }));

    const mockVocabList = [
      { isSelected: true, chinese: "你好" },
      { isSelected: false, chinese: "谢谢" },
    ];
    browser.tabs.sendMessage = vi.fn().mockResolvedValue(mockVocabList);

    render(<SendToAnkiButton isSelected={true} />);
    fireEvent.click(screen.getByText("Send to Anki"));

    await waitFor(() => {
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
        command: "getVocabList",
      });
      // Verify only selected items are processed
      expect(exportAnkiCards).toHaveBeenCalledWith(
        [{ isSelected: true, chinese: "你好" }],
        expect.any(Function),
        expect.any(Object),
      );
    });
  });

  it("updates progress during export", async () => {
    const mockVocabList = [
      { isSelected: true, chinese: "你好" },
      { isSelected: true, chinese: "谢谢" },
    ];
    browser.tabs.sendMessage = vi.fn().mockResolvedValueOnce(mockVocabList);

    render(<SendToAnkiButton isSelected={false} />);
    fireEvent.click(screen.getByText("Send to Anki"));

    await waitFor(() => {
      expect(screen.getByText("Loading (0/2) ...")).toBeInTheDocument();
    });
  });

  it("disables button during export", async () => {
    vi.mock("yanki-connect", () => ({
      YankiConnect: vi.fn().mockImplementation(() => ({
        deck: {
          deckNames: vi.fn().mockResolvedValue(["Default"]),
        },
      })),
    }));

    render(<SendToAnkiButton isSelected={false} />);
    const button = screen.getByText("Send to Anki");
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    expect(button).not.toBeDisabled();
  });
});
