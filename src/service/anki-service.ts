import { AnkiConfig } from "@/types/anki-config.ts";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";

export interface AnkiService {
  createModel(
    modelName: string,
    frontTemplate: string,
    backTemplate: string,
  ): Promise<void | object>;
  getModels(): Promise<void | string[]>;
  createDeck(deckName: string): Promise<Record<string, number>>;
  getDecks(): Promise<void | string[]>;

  addNote(
    ankiConfig: AnkiConfig,
    item: VocabListEntry,
    filename: string,
  ): Promise<number | void | null>;
  storeMedia(item: VocabListEntry): Promise<void | string>;
}
