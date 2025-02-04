import exportAnkiCards from "@/lib/export-anki-cards.ts";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import Tab = browser.tabs.Tab;
import { YankiConnect } from "yanki-connect";

function SendToAnkiButton({ isSelected }: { isSelected: boolean }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [length, setLength] = useState<number>(0);

  const sentToAnkiAction = async (client: YankiConnect) => {
    const send = async (tabs: Tab[], client: YankiConnect) => {
      const isError = await client.deck
        .deckNames()
        .then(() => false)
        .catch(() => true);

      if (isError) {
        await browser.tabs.sendMessage(tabs[0].id as number, {
          command: "error",
          errorMessage:
            "Anki not running or Anki Connect plugin is not installed.",
        });
      } else {
        browser.tabs
          .sendMessage(tabs[0].id as number, {
            command: "getVocabList",
          })
          .then(async (r: VocabListEntry[]) => {
            if (isSelected) {
              r = r.filter((item) => item.isSelected);
            }

            setLength(r.length);

            setIsLoading(true);
            exportAnkiCards(r, setProgress, client)
              .then(() => setIsLoading(false))
              .catch((error) => console.log(error));
          });
      }

      return tabs;
    };

    await browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => send(tabs, client));
  };

  return (
    <Button
      variant={"secondary"}
      disabled={isLoading}
      onClick={() => sentToAnkiAction(new YankiConnect())}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Loading ({progress}/{length}) ...
        </>
      ) : (
        "Send to Anki"
      )}
    </Button>
  );
}

export default SendToAnkiButton;
