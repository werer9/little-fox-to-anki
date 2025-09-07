import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { BrowserService } from "@/service/browser-service.ts";
import { AnkiService } from "@/service/anki-service.ts";
import { useAnkiExportStore } from "@/stores/anki-export-store.ts";
import { act, renderHook } from "@testing-library/react";
import { createUseAnkiExport } from "@/hooks/use-anki-export.ts";
import { Command } from "@/types/command.ts";
import { sampleList } from "@/__mocks__/sample-list.ts";

describe("test useAnkiExport hook", () => {
  const mockBrowserService = mockDeep<BrowserService>();
  const mockAnkiService = mockDeep<AnkiService>();
  const mockSetProgress = vi.fn();
  const mockSetStatus = vi.fn();

  beforeEach(() => {
    vi.mock("@/stores/anki-export-store.ts");
    vi.mocked(useAnkiExportStore).mockReturnValue({
      setProgress: mockSetProgress,
      setStatus: mockSetStatus,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("pass an unfiltered list", async () => {
    const { result } = renderHook(
      createUseAnkiExport(mockAnkiService, mockBrowserService),
    );

    await act(async () => {
      await result.current.sendToAnki(sampleList, false);
    });

    expect(mockSetProgress).toBeCalledTimes(3);
    expect(mockSetStatus).toBeCalledWith("inprogress");
    expect(mockSetStatus).toBeCalledWith("complete");
    expect(mockBrowserService.sendMessage).toBeCalledWith(
      Command.Error,
      "Export completed",
    );
    expect(mockAnkiService.storeMedia).toBeCalledTimes(2);
    expect(mockAnkiService.addNote).toBeCalledTimes(2);
  });

  it("pass a filtered list", async () => {
    const { result } = renderHook(
      createUseAnkiExport(mockAnkiService, mockBrowserService),
    );

    await act(async () => {
      await result.current.sendToAnki(sampleList, true);
    });

    expect(mockSetProgress).toBeCalledTimes(2);
    expect(mockSetStatus).toBeCalledWith("inprogress");
    expect(mockSetStatus).toBeCalledWith("complete");
    expect(mockBrowserService.sendMessage).toBeCalledWith(
      Command.Error,
      "Export completed",
    );
    expect(mockAnkiService.storeMedia).toBeCalledTimes(1);
    expect(mockAnkiService.addNote).toBeCalledTimes(1);
  });

  it("anki service create model fails", async () => {
    const error = new Error("error");
    mockAnkiService.createModel.mockRejectedValue(error);

    const { result } = renderHook(
      createUseAnkiExport(mockAnkiService, mockBrowserService),
    );

    await act(async () => {
      await result.current.sendToAnki(sampleList, true);
    });

    expect(mockSetProgress).not.toBeCalled();
    expect(mockSetStatus).toBeCalledWith("error", error);
    expect(mockBrowserService.sendMessage).toBeCalledWith(
      Command.Error,
      `There was a problem exporting to Anki: ${error}`,
    );
    expect(mockAnkiService.storeMedia).not.toBeCalled();
    expect(mockAnkiService.addNote).not.toBeCalled();
  });

  it("browser service fails", async () => {
    mockBrowserService.sendMessage.mockRejectedValueOnce(undefined);

    const { result } = renderHook(
      createUseAnkiExport(mockAnkiService, mockBrowserService),
    );

    await act(async () => {
      await result.current.sendToAnki(sampleList, true);
    });

    expect(mockSetProgress).toBeCalledTimes(2);
    expect(mockSetStatus).toBeCalledWith("inprogress");
    expect(mockSetStatus).not.toBeCalledWith("complete");
    expect(mockSetStatus).toBeCalledWith("error", undefined);
    expect(mockBrowserService.sendMessage).toBeCalledWith(
      Command.Error,
      `There was a problem exporting to Anki: undefined`,
    );
    expect(mockAnkiService.storeMedia).toBeCalled();
    expect(mockAnkiService.addNote).toBeCalled();
  });
});
