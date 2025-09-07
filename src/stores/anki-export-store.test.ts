import { beforeEach, describe, expect, it } from "vitest";
import { useAnkiExportStore } from "@/stores/anki-export-store.ts";
import { act, renderHook } from "@testing-library/react";

describe("useAnkiExportStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAnkiExportStore());
    act(() => result.current.reset());
    expect(result.current.status).toEqual("idle");
    expect(result.current.progress).toEqual(0);
    expect(result.current.total).toEqual(0);
    expect(result.current.error).toBeNull();
  });

  it("set status success", async () => {
    const { result } = renderHook(() => useAnkiExportStore());
    act(() => result.current.setStatus("complete"));
    expect(result.current.status).toEqual("complete");
  });

  it("set progress success", async () => {
    const { result } = renderHook(() => useAnkiExportStore());
    act(() => result.current.setProgress(1, 10));
    expect(result.current.progress).toEqual(1);
    expect(result.current.total).toEqual(10);
  });

  it("set error success", async () => {
    const { result } = renderHook(() => useAnkiExportStore());
    act(() => result.current.setStatus("error", "error"));
    expect(result.current.status).toEqual("error");
    expect(result.current.error).toEqual("error");
  });
});
