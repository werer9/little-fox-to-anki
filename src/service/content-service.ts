import { VocabListEntry } from "@/types/vocab-list-entry.ts";

export interface ContentService {
  getVocabList(document: Document): VocabListEntry[];
}
