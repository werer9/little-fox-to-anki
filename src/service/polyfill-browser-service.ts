import { BrowserService } from "@/service/browser-service.ts";
import { Command } from "@/types/command.ts";
import { AnkiMessage } from "@/types/anki-message.ts";

export class PolyfillBrowserService implements BrowserService {
  async getTemplate(url: string): Promise<string> {
    return await fetch(browser.runtime.getURL(url))
      .then((res) => {
        console.log(res);
        return res.text();
      })
      .catch((err) => {
        console.log(err.message);
        return "There was an error";
      });
  }

  sendMessage(command: Command, message?: string): Promise<void> {
    const ankiMessage: AnkiMessage = {
      command: command,
      errorMessage: message,
    };

    return browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        browser.tabs
          .sendMessage(tabs[0].id as number, ankiMessage)
          .then((r) => console.log(r));
      })
      .catch((error) => console.log(error.message));
  }
}
