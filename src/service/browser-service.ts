import { VocabListEntry } from "@/types/vocab-list-entry.ts";

export interface BrowserService {
  getTemplate(url: string): Promise<string>;

  sendMessage(
    command: string,
    message?: string,
  ): Promise<void | VocabListEntry[]>;
}
