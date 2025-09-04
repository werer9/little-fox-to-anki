import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { PolyfillBrowserService } from "@/service/polyfill-browser-service.ts";
import { Command } from "@/types/command.ts";
import type { Browser } from "webextension-polyfill";
import { mockDeep } from "vitest-mock-extended";
import * as jsdom from "jsdom";

// Stub the global browser object
const virtualConsole = new jsdom.VirtualConsole();
const testDOMWindow = new jsdom.JSDOM("", {
  virtualConsole,
  // This option is needed to allow the polyfill script to be executed
  // inside the jsdom window as a tag script (and it is actually the
  // only script executed inside the test jsdom window).
  runScripts: "dangerously",
}).window;

const mockBrowser = mockDeep<Browser>();
testDOMWindow.browser = mockBrowser;

describe("getTemplate", () => {
  let browserService: PolyfillBrowserService;
  let consoleMock = vi.spyOn(console, "log");

  beforeEach(() => {
    vi.stubGlobal("browser", mockBrowser);
    testDOMWindow.chrome = mockBrowser;
    vi.stubGlobal("window", testDOMWindow);

    vi.stubGlobal("fetch", vi.fn());
    consoleMock = vi.spyOn(console, "log");
    browserService = new PolyfillBrowserService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("when the url resolves", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response("test")));
    const result = browserService.getTemplate("https://example.com/");
    expect(await result).toBe("test");
  });

  it("when the url doest not resolve", async () => {
    vi.stubGlobal("fetch", () => Promise.reject("File not found"));
    const result = browserService.getTemplate("https://example.com/");
    expect(await result).toBe("There was an error");
  });

  it("when browser service sends message successfully", async () => {
    mockBrowser.tabs.sendMessage.mockResolvedValue(undefined);
    mockBrowser.tabs.query.mockResolvedValue([
      {
        id: 123,
        index: 0,
        highlighted: false,
        active: false,
        pinned: false,
        incognito: false,
      },
    ]);
    await browserService.sendMessage(Command.GetVocabList);
    expect(mockBrowser.tabs.sendMessage).toBeCalled();
  });

  it("when browser service sends message unsuccessfully", async () => {
    const error = new Error("error");
    mockBrowser.tabs.query.mockRejectedValue(error);
    await browserService.sendMessage(Command.GetVocabList);
    expect(consoleMock).toHaveBeenCalledWith("error");
    expect(mockBrowser.tabs.sendMessage).not.toBeCalled();
  });
});
