import { BrowserService } from "@/service/browser-service.ts";
import { Command } from "@/types/command.ts";
import { AnkiMessage } from "@/types/anki-message.ts";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";

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

  async sendMessage(
    command: Command,
    message?: string,
  ): Promise<void | VocabListEntry[]> {
    const ankiMessage: AnkiMessage = {
      command: command,
      errorMessage: message,
    };

    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      return await browser.tabs
        .sendMessage(tabs[0].id as number, ankiMessage)
        .then((r) => {
          console.log(r);
          if (r as VocabListEntry[]) {
            return r;
          }
        });
    } catch (error) {
      return console.log((error as Error).message);
    }
  }
}
