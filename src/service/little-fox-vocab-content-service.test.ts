import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LittleFoxVocabContentService } from "@/service/little-fox-vocab-content-service.ts";
import { level1Page, level3Page } from "@/__mocks__/littlefox-pages.ts";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { sampleList } from "@/__mocks__/sample-list.ts";

const contentService = new LittleFoxVocabContentService();
const level3Element = level3Page();
const level1Element = level1Page();

describe("getVocabList", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should load a level 3 page successfully", () => {
    document.body.appendChild(level3Element);
    const vocabList = contentService.getVocabList(document);
    const expectedList = sampleList;
    expectedList[1].isSelected = false;
    expect(vocabList).toEqual(expectedList);
  });

  it("should load a level 1 page successfully", () => {
    document.body.appendChild(level1Element);
    const vocabList = contentService.getVocabList(document);
    const expectedVocabList: VocabListEntry[] = [
      {
        isSelected: false,
        audioUrl:
          "http://cdn.littlefox.co.kr/cn/vocab/5/57ca19768ae5f042c06cbaa1fee68568.mp3?49121109",
        chinese: "恐龙",
        pinyin: "kǒnglóng",
        english: "dinosaur",
        exampleSentence: "小恐龙朋友们在公园。",
      },
      {
        isSelected: false,
        audioUrl:
          "http://cdn.littlefox.co.kr/cn/vocab/3/369a6d9cdd8570b5b2bcdb1c45211eab.mp3?14120313",
        chinese: "公园",
        pinyin: "gōngyuán",
        english: "park",
        exampleSentence: "恐龙来到公园。",
      },
    ];
    expect(vocabList).toEqual(expectedVocabList);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
