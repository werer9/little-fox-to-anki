import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { BrowserService } from "@/service/browser-service.ts";
import { useVocabList } from "@/hooks/use-vocab-list.ts";
import { act, renderHook, waitFor } from "@testing-library/react";
import { sampleList } from "@/__mocks__/sample-list.ts";
import useSWR from "swr";

describe("test useVocabList hook", () => {
  const mockBrowser = mockDeep<BrowserService>();
  beforeEach(() => {
    vi.mock("swr");
    mockBrowser.sendMessage.mockResolvedValue(sampleList);
  });

  afterEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("successfully load vocab list", async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: sampleList as VocabListEntry[],
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useVocabList(mockBrowser));

    const { vocabList, error, isLoading } = result.current;
    expect(vocabList).toEqual(sampleList);
    expect(error).toEqual("undefined");
    expect(isLoading).toBeFalsy();
    expect(useSWR).toBeCalled();
  });

  it("vocab list is loading", async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useVocabList(mockBrowser));

    const { vocabList, error, isLoading } = result.current;
    expect(vocabList).toBeUndefined();
    expect(error).toEqual("undefined");
    expect(isLoading).toBeTruthy();
    expect(useSWR).toBeCalled();
  });

  it("vocab list error", async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: new Error("error"),
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });

    const { result } = renderHook(() => useVocabList(mockBrowser));

    const { vocabList, error, isLoading } = result.current;
    expect(vocabList).toBeUndefined();
    expect(error).toEqual("error");
    expect(isLoading).toBeFalsy();
    expect(useSWR).toBeCalled();
  });

  it("calls fetcher", async () => {
    // For this test, we need to properly handle the unmocking
    // First, reset all mocks
    vi.resetAllMocks();
    vi.resetModules();

    // Then re-import the actual implementation
    const actualSWR = await vi.importActual("swr");
    vi.doMock("swr", () => actualSWR);

    // Re-import the hook to use the actual useSWR
    const { useVocabList } = await import("@/hooks/use-vocab-list.ts");
    mockBrowser.sendMessage.mockResolvedValue(sampleList);

    const { result } = renderHook(() => useVocabList(mockBrowser));
    await act(() => result.current.mutate());
    await waitFor(() => {
      expect(result.current.vocabList).toEqual(sampleList);
    });

    expect(mockBrowser.sendMessage).toHaveBeenCalled();
  });

  it("calls fetcher but fetcher fails", async () => {
    // For this test, we need to properly handle the unmocking
    // First, reset all mocks
    vi.resetAllMocks();
    vi.resetModules();

    // Then re-import the actual implementation
    const actualSWR = await vi.importActual("swr");

    vi.doMock("swr", () => actualSWR);
    // Re-import the hook to use the actual useSWR
    const { useVocabList } = await import("@/hooks/use-vocab-list.ts");
    mockBrowser.sendMessage.mockRejectedValue(new Error("error"));

    const { result } = renderHook(() => useVocabList(mockBrowser));
    await act(() => result.current.mutate());
    await waitFor(() => {
      expect(result.current.error).toEqual("error");
    });

    expect(mockBrowser.sendMessage).toHaveBeenCalled();
  });
});
