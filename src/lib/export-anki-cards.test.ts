import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import exportAnkiCards from "./export-anki-cards";
import type { YankiConnect } from "yanki-connect";

// Mock the browser runtime API
vi.mock("webextension-polyfill", () => ({
  default: {
    runtime: {
      getURL: vi
        .fn()
        .mockImplementation((path) => `chrome-extension://mock-id/${path}`),
    },
    tabs: {
      query: vi.fn(() => Promise.resolve([{ id: 123 }])),
      sendMessage: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

// Mock fetch
vi.stubGlobal("fetch", vi.fn());
// Mock YankiConnect client
const mockYankiConnect: YankiConnect = {
  model: {
    modelNames: vi.fn(),
    createModel: vi.fn(),
  },
  deck: {
    deckNames: vi.fn(),
    createDeck: vi.fn(),
  },
  note: {
    addNote: vi.fn(),
  },
  media: {
    storeMediaFile: vi.fn(),
  },
} as unknown as YankiConnect;

// Mock React setState
const mockSetProgress = vi.fn();

describe("exportAnkiCards", () => {
  const mockVocabList: VocabListEntry[] = [
    {
      isSelected: true,
      audioUrl: "http://example.com/audio1.mp3",
      chinese: "你好",
      pinyin: "nǐ hǎo",
      english: "Hello",
      exampleSentence: "你好吗？",
    },
    {
      isSelected: true,
      audioUrl: "http://example.com/audio2.mp3",
      chinese: "谢谢",
      pinyin: "xiè xie",
      english: "Thank you",
      exampleSentence: "谢谢你",
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock fetch responses for templates
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((urlInput: string | URL) => {
        if (urlInput === undefined) {
          return Promise.reject(new Error("Invalid URL"));
        }
        const url: string = urlInput.toString();

        if (url.includes("front")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve("Front template content"),
          });
        }
        if (url.includes("back")) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve("Back template content"),
          });
        }
        return Promise.reject(new Error("Invalid URL"));
      }),
    );

    // Mock YankiConnect methods
    mockYankiConnect.model.modelNames = vi.fn().mockResolvedValue([]);
    mockYankiConnect.model.createModel = vi
      .fn()
      .mockResolvedValue({ success: true });
    mockYankiConnect.deck.deckNames = vi.fn().mockResolvedValue([]);
    mockYankiConnect.deck.createDeck = vi
      .fn()
      .mockResolvedValue({ result: 123 });
    mockYankiConnect.media.storeMediaFile = vi
      .fn()
      .mockImplementation(() => Promise.resolve("audio.mp3"));
    mockYankiConnect.note.addNote = vi.fn().mockResolvedValue({ result: 456 });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should create model if it does not exist", async () => {
    mockYankiConnect.model.modelNames = vi.fn().mockResolvedValue([]);

    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    expect(mockYankiConnect.model.createModel).toHaveBeenCalledWith({
      modelName: "Little Fox Note",
      inOrderFields: expect.arrayContaining([
        "Simplified",
        "Traditional",
        "StrokeOrder",
        "PinyinNumbered",
        "SimplifiedSentence",
        "TraditionalSentence",
        "SentencePinyin",
        "English",
        "Audio",
        "SentenceAudio",
      ]),
      cardTemplates: [
        {
          Name: "Recognition",
          Front: "Front template content",
          Back: "Back template content",
        },
      ],
    });
  });

  it("should fetch card templates successfully", async () => {
    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(
      "chrome-extension://mock-id/recognition_card_front.txt",
    );
    expect(fetch).toHaveBeenCalledWith(
      "chrome-extension://mock-id/recognition_card_back.txt",
    );
  });

  it("should handle template fetch errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Template not found")),
    );

    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    // Verify the function continues execution even if template fetch fails
    expect(mockYankiConnect.model.createModel).toHaveBeenCalled();
  });

  it("should not create model if it already exists", async () => {
    mockYankiConnect.model.modelNames = vi
      .fn()
      .mockResolvedValueOnce(["Little Fox Note"]);

    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    expect(mockYankiConnect.model.createModel).not.toHaveBeenCalled();
  });

  it("should create deck if it does not exist", async () => {
    mockYankiConnect.deck.deckNames = vi.fn().mockResolvedValueOnce([]);

    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    expect(mockYankiConnect.deck.createDeck).toHaveBeenCalledWith({
      deck: "Little Fox",
    });
  });

  it("should not create deck if it already exists", async () => {
    mockYankiConnect.deck.deckNames = vi
      .fn()
      .mockResolvedValueOnce(["Little Fox"]);

    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    expect(mockYankiConnect.deck.createDeck).not.toHaveBeenCalled();
  });

  it("should process all vocabulary items and update progress", async () => {
    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    // Verify progress updates
    expect(mockSetProgress).toHaveBeenCalledTimes(mockVocabList.length);
    expect(mockSetProgress).toHaveBeenCalledWith(1);
    expect(mockSetProgress).toHaveBeenCalledWith(2);

    // Verify notes were added
    expect(mockYankiConnect.note.addNote).toHaveBeenCalledTimes(
      mockVocabList.length,
    );
  });

  it("should store media files for audio URLs", async () => {
    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    expect(mockYankiConnect.media.storeMediaFile).toHaveBeenCalledTimes(
      mockVocabList.length,
    );
    expect(mockYankiConnect.media.storeMediaFile).toHaveBeenCalledWith({
      url: "http://example.com/audio1.mp3",
      deleteExisting: false,
      filename: "_你好.mp3",
    });
  });

  it("should send completion message when finished", async () => {
    await exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect);

    expect(browser.tabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
    expect(browser.tabs.sendMessage).toHaveBeenCalledWith(123, {
      command: "error",
      errorMessage: "Export completed",
    });
  });

  it("should handle errors during note creation", async () => {
    mockYankiConnect.note.addNote = vi
      .fn()
      .mockRejectedValue(new Error("Note creation failed"));

    await expect(
      exportAnkiCards(mockVocabList, mockSetProgress, mockYankiConnect),
    ).resolves.not.toThrow();

    // Verify the function continues with remaining items
    expect(mockYankiConnect.note.addNote).toHaveBeenCalledTimes(
      mockVocabList.length,
    );
  });
});
