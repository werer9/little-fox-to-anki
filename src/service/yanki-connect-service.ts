import { YankiConnect } from "yanki-connect";
import { AnkiService } from "@/service/anki-service.ts";
import { AnkiConfig } from "@/types/anki-config.ts";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";

export class YankiConnectService implements AnkiService {
  private client: YankiConnect;

  constructor(client: YankiConnect) {
    this.client = client;
  }

  async createModel(
    modelName: string,
    frontTemplate: string,
    backTemplate: string,
  ): Promise<void | object> {
    const result = await this.client.model
      .createModel({
        modelName: modelName,
        inOrderFields: [
          "Simplified",
          "Traditional",
          "StrokeOrder",
          "PinyinNumbered",
          "SimplifiedSentence",
          "TraditionalSentence",
          "SentencePinyin",
          "English",
          "Audio",
          "SentenceAudio",
        ],
        cardTemplates: [
          {
            Name: "Recognition",
            Front: frontTemplate,
            Back: backTemplate,
          },
        ],
      })
      .catch((err) => console.log(err.message));

    console.log(result);
    return result;
  }

  async getModels(): Promise<void | string[]> {
    return await this.client.model.modelNames();
  }

  async createDeck(deckName: string): Promise<Record<string, number>> {
    const result = await this.client.deck.createDeck({ deck: deckName });
    console.log(result);
    return result;
  }

  async getDecks(): Promise<void | string[]> {
    return await this.client.deck.deckNames();
  }

  async addNote(
    ankiConfig: AnkiConfig,
    item: VocabListEntry,
    filename: string,
  ): Promise<number | void | null> {
    const result = await this.client.note
      .addNote({
        note: {
          deckName: ankiConfig.deckName,
          modelName: ankiConfig.modelName,
          fields: {
            Simplified: item.chinese,
            PinyinNumbered: item.pinyin,
            SimplifiedSentence: item.exampleSentence,
            English: item.english,
            Audio: `[sound:${filename}]`,
          },
          options: {
            allowDuplicate: false,
            duplicateScope: "deck",
            duplicateScopeOptions: {
              deckName: ankiConfig.deckName,
              checkChildren: false,
              checkAllModels: false,
            },
          },
        },
      })
      .catch((err) => console.log(err.message));

    console.log(result);
    return result;
  }

  async storeMedia(item: VocabListEntry): Promise<void | string> {
    return await this.client.media
      .storeMediaFile({
        url: item.audioUrl ?? undefined,
        deleteExisting: false,
        filename: `_${item.chinese}.mp3`,
      })
      .catch((err) => {
        console.log(`Could not load audio file: ${err.message}`);
      });
  }
}
