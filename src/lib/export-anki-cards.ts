import { YankiConnect } from "yanki-connect";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { AnkiConfig } from "@/types/anki-config.ts";
import { Command } from "@/types/command";
import { PolyfillBrowserService } from "@/service/polyfill-browser-service.ts";
import { BrowserService } from "@/service/browser-service.ts";
import { YankiConnectService } from "@/service/yanki-connect-service.ts";
import { AnkiService } from "@/service/anki-service.ts";

const exportAnkiCards = async (
  vocabList: VocabListEntry[],
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  client: YankiConnect,
) => {
  const ankiConfig: AnkiConfig = {
    deckName: "Little Fox",
    modelName: "Little Fox Note",
    frontCard: "recognition_card_front.html",
    backCard: "recognition_card_back.html",
  };

  const browserService: BrowserService = new PolyfillBrowserService();
  const ankiService: AnkiService = new YankiConnectService(client);

  const frontTemplate = browserService.getTemplate(ankiConfig.frontCard);
  const backTemplate = browserService.getTemplate(ankiConfig.backCard);

  const models = await ankiService.getModels();
  console.log(models); // ["Your", "Deck", "Names", "Here"]
  await ankiService.createModel(
    ankiConfig.modelName,
    await frontTemplate,
    await backTemplate,
  );

  await ankiService.createDeck(ankiConfig.deckName);

  for (const [index, item] of vocabList.entries()) {
    setProgress(index + 1);
    const filename = ankiService.storeMedia(item);

    await ankiService.addNote(ankiConfig, item, (await filename) ?? "");

    browserService.sendMessage(Command.Error, "Export completed");
  }
};

export default exportAnkiCards;
