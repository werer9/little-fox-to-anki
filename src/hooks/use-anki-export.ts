import { useAnkiExportStore } from "@/stores/anki-export-store.ts";
import { AnkiConfig } from "@/types/anki-config.ts";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { YankiConnect } from "yanki-connect";
import { AnkiService } from "@/service/anki-service.ts";
import { YankiConnectService } from "@/service/yanki-connect-service.ts";
import { PolyfillBrowserService } from "@/service/polyfill-browser-service.ts";
import { BrowserService } from "@/service/browser-service.ts";
import { Command } from "@/types/command.ts";

const ankiConfig: AnkiConfig = {
  deckName: "Little Fox",
  modelName: "Little Fox Note",
  frontCard: "recognition_card_front.html",
  backCard: "recognition_card_back.html",
};

export const createUseAnkiExport = (
  ankiService: AnkiService,
  browserService: BrowserService,
) => {
  return () => {
    const { setProgress, setStatus } = useAnkiExportStore();

    const sendToAnki = async (
      vocabList: VocabListEntry[],
      isSelected: boolean,
    ) => {
      const filteredVocabList = isSelected
        ? vocabList.filter((item) => item.isSelected)
        : vocabList;
      try {
        await ankiService.createModel(
          ankiConfig.modelName,
          ankiConfig.frontCard,
          ankiConfig.backCard,
        );
        await ankiService.createDeck(ankiConfig.deckName);

        setProgress(0, filteredVocabList.length);
        setStatus("inprogress");

        for (const [index, item] of filteredVocabList.entries()) {
          setProgress(index + 1, filteredVocabList.length);
          const filename = ankiService.storeMedia(item);

          await ankiService.addNote(ankiConfig, item, (await filename) ?? "");
        }

        await browserService.sendMessage(Command.Error, "Export completed");
        setStatus("complete");
      } catch (error) {
        await browserService.sendMessage(
          Command.Error,
          `There was a problem exporting to Anki: ${error}`,
        );
        setStatus("error", error as string);
      }
    };

    return { sendToAnki };
  };
};

export const useAnkiExport = createUseAnkiExport(
  new YankiConnectService(new YankiConnect()),
  new PolyfillBrowserService(),
);
