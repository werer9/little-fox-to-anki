import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleVocabularyClick, viewVocab } from "./content";

// Mock the browser runtime API
vi.mock("webextension-polyfill", () => ({
  default: {
    runtime: {
      onMessage: {
        addListener: vi.fn(),
      },
    },
  },
}));

// Mock document and window methods
const mockDocument = {
  getElementsByClassName: vi.fn(),
  addEventListener: vi.fn(),
};

const mockWindow = {
  open: vi.fn(),
  alert: vi.fn(),
};

const notVocabElement = document.createElement("div");
const vocabElement = document.createElement("div");
const vocabElementWithFcid = document.createElement("div");
vocabElementWithFcid.className = "vocabulary";
vocabElement.className = "vocabulary";
vocabElementWithFcid.setAttribute("fc_id", "123");

beforeEach(() => {
  window.alert = vi.fn();
  vi.stubGlobal("document", mockDocument);
  vi.stubGlobal("window", mockWindow);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("handleVocabularyClick", () => {
  it("should do nothing when not clicking on a vocabulary element", () => {
    const mockEvent = {
      target: notVocabElement,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    handleVocabularyClick(mockEvent);
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it("should handle click on vocabulary element with fc_id", () => {
    const mockEvent = {
      target: vocabElementWithFcid,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    handleVocabularyClick(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it("should log error when fc_id is missing", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockEvent = {
      target: vocabElement,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    handleVocabularyClick(mockEvent);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "fc_id attribute is missing on the .vocabulary element",
    );
  });
});

describe("viewVocab", () => {
  it("should open a new window with the correct URL", async () => {
    mockWindow.open.mockReturnValue({});
    await viewVocab("456");
    expect(mockWindow.open).toHaveBeenCalledWith(
      "/en/supplement/vocabulary/456",
      "_blank",
    );
  });

  it("should handle popup blocking", async () => {
    mockWindow.open.mockReturnValue(null);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await viewVocab("456");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Popup blocked or failed to open.",
    );
  });
});
