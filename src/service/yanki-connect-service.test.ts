import { afterEach, beforeEach, describe, vi, it, expect } from "vitest";
import { AnkiService } from "@/service/anki-service.ts";
import { mockDeep } from "vitest-mock-extended";
import { YankiConnect } from "yanki-connect";
import { YankiConnectService } from "@/service/yanki-connect-service.ts";
import { exampleModel } from "@/__mocks__/yanki-connect-models.ts";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { AnkiConfig } from "@/types/anki-config.ts";

let yankiConnectService: AnkiService;
const mockYankiConnect = mockDeep<YankiConnect>();
let mockConsole = vi.spyOn(console, "log");

const testEntry: VocabListEntry = {
  isSelected: false,
  audioUrl:
    "http://cdn.littlefox.co.kr/cn/vocab/9/9429e0fa71eaab5b1faac92503c42cd5.mp3?56080212",
  chinese: "销售员",
  pinyin: "xiāoshòuyuán",
  english: "salesman",
  exampleSentence: "我的爸爸做了很长一段时间的旅行销售员。",
};

const ankiConfig: AnkiConfig = {
  deckName: "test",
  modelName: "test",
  frontCard: "test",
  backCard: "test",
};

describe("Yanki connect service", () => {
  beforeEach(() => {
    yankiConnectService = new YankiConnectService(mockYankiConnect);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("createModel", () => {
    beforeEach(() => {
      mockConsole = vi.spyOn(console, "log");
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("model is created successfully", async () => {
      mockYankiConnect.model.createModel.mockResolvedValue(exampleModel);
      const result = await yankiConnectService.createModel(
        exampleModel.name,
        exampleModel.tmpls[0].afmt,
        exampleModel.tmpls[0].qfmt,
      );

      expect(mockYankiConnect.model.createModel).toBeCalled();
      expect(result).toEqual(exampleModel);
      expect(mockConsole).toHaveBeenCalledWith(exampleModel);
    });

    it("model is not created successfully", async () => {
      const error = new Error("Failed to create model");
      mockYankiConnect.model.createModel.mockRejectedValue(error);
      const result = await yankiConnectService.createModel(
        exampleModel.name,
        exampleModel.tmpls[0].afmt,
        exampleModel.tmpls[0].qfmt,
      );

      expect(result).not.toEqual(exampleModel);
      expect(result).toBeUndefined();
      expect(mockConsole).toHaveBeenCalledWith(error.message);
    });
  });

  describe("getters", () => {
    it("gets model names successfully", async () => {
      const expectedResult = ["test"];
      mockYankiConnect.model.modelNames.mockResolvedValue(expectedResult);
      const result = await yankiConnectService.getModels();
      expect(result).toEqual(expectedResult);
    });

    it("gets deck names successfully", async () => {
      const expectedResult = ["test"];
      mockYankiConnect.deck.deckNames.mockResolvedValue(expectedResult);
      const result = await yankiConnectService.getDecks();
      expect(result).toEqual(expectedResult);
    });
  });

  it("createDeck", async () => {
    mockConsole = vi.spyOn(console, "log");
    const expectedResult: Record<string, number> = { test: 123 };
    mockYankiConnect.deck.createDeck.mockResolvedValue(expectedResult);
    const result = await yankiConnectService.createDeck("test");

    expect(mockConsole).toHaveBeenCalledWith(expectedResult);
    expect(result).toEqual(expectedResult);
  });

  describe("storeMedia", () => {
    beforeEach(() => {
      mockConsole = vi.spyOn(console, "log");
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("store media is successful", async () => {
      const expectedResult = `_${testEntry.chinese}.mp3`;

      mockYankiConnect.media.storeMediaFile.mockResolvedValue(expectedResult);
      const result = await yankiConnectService.storeMedia(testEntry);
      expect(result).toEqual(expectedResult);
    });

    it("store media is not successful", async () => {
      const expectedResult = new Error("");
      mockYankiConnect.media.storeMediaFile.mockRejectedValue(expectedResult);
      const result = await yankiConnectService.storeMedia(testEntry);
      expect(mockConsole).toHaveBeenCalledWith("Could not load audio file: ");
      expect(result).toBeUndefined();
    });
  });

  describe("addNote", () => {
    beforeEach(() => {
      mockConsole = vi.spyOn(console, "log");
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("note is created successfully", async () => {
      const expectedResult = 123;
      mockYankiConnect.note.addNote.mockResolvedValue(expectedResult);
      const result = await yankiConnectService.addNote(
        ankiConfig,
        testEntry,
        "test.mp3",
      );

      expect(mockConsole).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it("note is created unsuccessfully", async () => {
      const expectedResult = new Error("Error!");
      mockYankiConnect.note.addNote.mockRejectedValue(expectedResult);
      const result = await yankiConnectService.addNote(
        ankiConfig,
        testEntry,
        "test.mp3",
      );

      expect(mockConsole).toHaveBeenCalledWith(expectedResult.message);
      expect(mockConsole).toHaveBeenCalledWith(undefined);
      expect(result).toBeUndefined();
    });
  });
});
