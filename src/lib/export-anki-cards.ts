import { YankiConnect } from "yanki-connect";

const exportAnkiCards = async (
  vocabList: VocabListEntry[],
  setProgress: React.Dispatch<React.SetStateAction<number>>,
) => {
  const client = new YankiConnect();
  const deckName = "Little Fox";
  const modelName = "Little Fox Note";
  const frontTemplate = await fetch(
    browser.runtime.getURL("recognition_card_front.txt"),
  )
    .then((res) => {
      console.log(res);
      return res.text();
    })
    .catch((err) => {
      console.log(err.message);
      return "There was an error";
    });
  const backTemplate = await fetch(
    browser.runtime.getURL("recognition_card_back.txt"),
  )
    .then((res) => {
      console.log(res);
      return res.text();
    })
    .catch((err) => {
      console.log(err.message);
      return "There was an error";
    });

  const models = await client.model.modelNames();
  console.log(models); // ["Your", "Deck", "Names", "Here"]
  if (!models.includes(modelName)) {
    const result = await client.model
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
      .catch((err) => console.log(err));

    console.log(result);
  }

  const deckNames = await client.deck.deckNames();
  if (!deckNames.includes(deckName)) {
    const result = await client.deck.createDeck({ deck: deckName });
    console.log(result);
  }

  for (const [index, item] of vocabList.entries()) {
    setProgress(index + 1);
    const filename = await client.media.storeMediaFile({
      deleteExisting: false,
      url: item.audioUrl,
      filename: `_${item.chinese}.mp3`,
    });

    const result = await client.note
      .addNote({
        note: {
          deckName: deckName,
          modelName: modelName,
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
              deckName: deckName,
              checkChildren: false,
              checkAllModels: false,
            },
          },
        },
      })
      .catch((err) => console.error(err));

    console.log(result);
  }

  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browser.tabs
      .sendMessage(tabs[0].id as number, {
        command: "error",
        errorMessage: "Export completed",
      })
      .catch((error) => console.log(error));
  });
};

export default exportAnkiCards;
