import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SendToAnkiButton from "@/components/SendToAnkiButton.tsx";
import { sampleList } from "@/__mocks__/sample-list.ts";
import "@testing-library/jest-dom/vitest";
import { useAnkiExportStore } from "@/stores/anki-export-store.ts";
import { useAnkiExport } from "@/hooks/use-anki-export.ts";

describe("test SendToAnkiButton", () => {
  const mockSendToAnki = vi.fn();

  beforeEach(() => {
    vi.mock("@/stores/anki-export-store.ts");
    vi.mock("@/hooks/use-anki-export.ts");
    vi.mocked(useAnkiExportStore).mockReturnValue({
      progress: 0,
      status: "idle",
      total: 0,
    });
    vi.mocked(useAnkiExport).mockReturnValue({ sendToAnki: mockSendToAnki });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Renders disabled", async () => {
    render(
      <SendToAnkiButton
        vocabList={sampleList}
        disabled={true}
        isSelected={false}
      />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveTextContent("Send to Anki");
  });

  it("Renders enabled", async () => {
    render(
      <SendToAnkiButton
        vocabList={sampleList}
        disabled={false}
        isSelected={false}
      />,
    );

    expect(screen.getByRole("button")).not.toBeDisabled();
    expect(screen.getByRole("button")).toHaveTextContent("Send to Anki");
  });

  it("Renders in progress", async () => {
    vi.mocked(useAnkiExportStore).mockReturnValue({
      progress: 0,
      status: "inprogress",
      total: 0,
    });

    render(
      <SendToAnkiButton
        vocabList={sampleList}
        disabled={false}
        isSelected={false}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(mockSendToAnki).toBeCalledWith(sampleList, false);
    expect(button).toHaveTextContent("Loading (0/0)");
  });
});
