import { vi, describe, expect, beforeEach, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SendToAnkiButton from "../../src/components/SendToAnkiButton";
import { YankiConnect } from "yanki-connect";

vi.mock("@/lib/export-anki-cards.ts", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("lucide-react", () => ({
  Loader2: vi.fn(() => <div>Loader</div>),
}));

global.browser = {
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn().mockResolvedValue([
      {
        isSelected: true,
        audioUrl: "test",
        chinese: "test",
        pinyin: "test",
        english: "test",
        exampleSentence: "test",
      },
      {
        isSelected: false,
        audioUrl: "test",
        chinese: "test",
        pinyin: "test",
        english: "test",
        exampleSentence: "test",
      },
    ]),
  },
} as never;

describe("SendToAnkiButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the button with 'Send to Anki' text when not loading", () => {
    render(<SendToAnkiButton isSelected={false} />);
    expect(screen.getByText("Send to Anki")).toBeDefined();
  });

  it("when clicked, loading icon is shown and button is disabled", async () => {
    // Mock yanki-connect
    vi.doMock("yanki-connect", () => {
      return {
        YankiConnect: vi.fn(() => ({
          deck: {
            deckNames: vi.fn(() =>
              Promise.resolve(["Little Fox", "Default Deck"]),
            ),
          },
        })),
      };
    });

    render(<SendToAnkiButton isSelected={false} />);
    browser.tabs.query = vi.fn().mockResolvedValue([{ id: 123 }]);
    fireEvent.click(screen.getByText("Send to Anki"));

    await waitFor(() => {
      expect(screen.getByText("Loader")).toBeDefined();
      expect(screen.getByText("Loading (0/2) ...")).toBeDefined();
      expect(screen.getByRole("button")).toHaveProperty("disabled");
    });
  });

  it("when clicked but Anki is offline, error message is shown", async () => {
    // Mock yanki-connect
    vi.doMock("yanki-connect", () => {
      return {
        YankiConnect: vi.fn(() => ({
          deck: {
            deckNames: vi.fn(() => Promise.reject(new Error("Error"))),
          },
        })),
      };
    });

    render(<SendToAnkiButton isSelected={false} />);
    browser.tabs.query = vi.fn().mockResolvedValue([{ id: 123 }]);
    YankiConnect.prototype.deck.deckNames = vi.fn(() =>
      Promise.reject("Error"),
    );

    const sendMessageSpy = vi.spyOn(global.browser.tabs, "sendMessage");

    fireEvent.click(screen.getByText("Send to Anki"));
    expect(sendMessageSpy).toBeCalledTimes(1);
    expect(sendMessageSpy).toBeCalledWith(123, {
      command: "error",
      errorMessage: "Anki not running or Anki Connect plugin is not installed.",
    });
  });
});
