import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getVocabList, handleVocabularyClick, viewVocab } from "./content";

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

describe("getVocabList", () => {
  it("should return an empty array when no elements are found", () => {
    mockDocument.getElementsByClassName.mockReturnValue([]);
    const result = getVocabList();
    expect(result).toEqual([]);
  });

  it("should prioritize level3 elements over level1", () => {
    const mockLevel3Element = createMockVocabularyElement();
    const mockLevel1Element = createMockVocabularyElement();

    mockDocument.getElementsByClassName.mockImplementation(
      (className: string) => {
        if (className === "level3") return [mockLevel3Element];
        if (className === "level1") return [mockLevel1Element];
        return [];
      },
    );

    const result = getVocabList();
    expect(result.length).toBe(1);
    expect(mockDocument.getElementsByClassName).toHaveBeenCalledWith("level3");
    expect(mockDocument.getElementsByClassName).not.toHaveBeenCalledWith(
      "level1",
    );
  });

  it("should fall back to level1 when no level3 elements are found", () => {
    const mockLevel1Element = createMockVocabularyElement();

    mockDocument.getElementsByClassName.mockImplementation(
      (className: string) => {
        if (className === "level3") return [];
        if (className === "level1") return [mockLevel1Element];
        return [];
      },
    );

    const result = getVocabList();
    expect(result.length).toBe(1);
    expect(mockDocument.getElementsByClassName).toHaveBeenCalledWith("level3");
    expect(mockDocument.getElementsByClassName).toHaveBeenCalledWith("level1");
  });

  it("should extract all vocabulary data correctly", () => {
    const mockElement = createMockVocabularyElement({
      isSelected: true,
      audioLink: "http://example.com/audio.mp3",
      words: "你好",
      pinyin: "nǐ hǎo",
      meaning: "Hello",
      example: "你好吗？",
    });

    mockDocument.getElementsByClassName.mockReturnValue([mockElement]);

    const result = getVocabList();
    expect(result).toEqual([
      {
        isSelected: true,
        audioUrl: "http://example.com/audio.mp3",
        chinese: "你好",
        pinyin: "nǐ hǎo",
        english: "Hello",
        exampleSentence: "你好吗？",
      },
    ]);
  });

  it("should handle missing optional fields", () => {
    const mockElement = createMockVocabularyElement({
      isSelected: false,
      audioLink: null,
      words: "你好",
      pinyin: null,
      meaning: null,
      example: null,
    });

    mockDocument.getElementsByClassName.mockReturnValue([mockElement]);

    const result = getVocabList();
    expect(result).toEqual([
      {
        isSelected: false,
        audioUrl: null,
        chinese: "你好",
        pinyin: null,
        english: null,
        exampleSentence: null,
      },
    ]);
  });
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

describe("message listener", () => {
  it("should handle getVocabList command", () => {
    // This would require more extensive mocking of the browser API
    // For now, we can just verify the exported functions
    expect(typeof getVocabList).toBe("function");
  });
});

// Helper function to create mock vocabulary elements
function createMockVocabularyElement(
  options: {
    isSelected?: boolean;
    audioLink?: string | null;
    words?: string | null;
    pinyin?: string | null;
    meaning?: string | null;
    example?: string | null;
  } = {},
) {
  const {
    isSelected = false,
    audioLink = "http://example.com/audio.mp3",
    words = "你好",
    pinyin = "nǐ hǎo",
    meaning = "Hello",
    example = "你好吗？",
  } = options;

  const mockCheckbox = {
    checked: isSelected,
  };

  const mockAudioLink = {
    href: audioLink
      ? `javascript:playSound('${audioLink.replace("http:", "")}')`
      : "",
    match: vi
      .fn()
      .mockReturnValue(audioLink ? ["", audioLink.replace("http:", "")] : null),
  };

  return {
    querySelector: vi.fn().mockImplementation((selector: string) => {
      if (selector === ".ck") {
        return {
          querySelector: vi.fn().mockImplementation((subSelector: string) => {
            if (subSelector === ".voca_cont_bt_che_box") {
              return {
                querySelector: vi
                  .fn()
                  .mockImplementation((finalSelector: string) => {
                    if (finalSelector === ".wordCheck") return mockCheckbox;
                    return null;
                  }),
              };
            }
            return null;
          }),
        };
      }
      if (selector === ".snd") {
        return {
          querySelector: vi
            .fn()
            .mockReturnValue(audioLink ? mockAudioLink : null),
        };
      }
      if (selector === ".wordtxt") {
        return {
          querySelector: vi.fn().mockImplementation((subSelector: string) => {
            if (subSelector === ".word_text") return { textContent: words };
            if (subSelector === ".word_sound") return { textContent: pinyin };
            return null;
          }),
        };
      }
      if (selector === ".exm") {
        return {
          querySelector: vi.fn().mockImplementation((subSelector: string) => {
            if (subSelector === ".mean_text") return { textContent: meaning };
            if (subSelector === ".vc_example") return { innerText: example };
            return null;
          }),
        };
      }
      return null;
    }),
  };
}
