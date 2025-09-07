import { mockDeep } from "vitest-mock-extended";
import { Browser } from "webextension-polyfill";

import * as jsdom from "jsdom";

const setup = () => {
  // Stub the global browser object
  const virtualConsole = new jsdom.VirtualConsole();
  const testDOMWindow = new jsdom.JSDOM("", {
    virtualConsole,
    // This option is needed to allow the polyfill script to be executed
    // inside the jsdom window as a tag script (and it is actually the
    // only script executed inside the test jsdom window).
    runScripts: "dangerously",
  }).window;

  testDOMWindow.browser = mockDeep<Browser>();
};
export default setup;
