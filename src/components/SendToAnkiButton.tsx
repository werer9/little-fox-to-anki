import exportAnkiCards from "@/lib/export-anki-cards.ts";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import Tab = browser.tabs.Tab;

function SendToAnkiButton({ isSelected }: { isSelected: boolean }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Button
      variant={"outline"}
      disabled={isLoading}
      onClick={async () => {
        const send = (tabs: Tab[]) => {
          browser.tabs
            .sendMessage(tabs[0].id as number, {
              test: "test",
            })
            .then(async (r: VocabListEntry[]) => {
              if (isSelected) {
                r = r.filter((item) => item.isSelected);
              }

              setIsLoading(true);
              exportAnkiCards(r).then(() => setIsLoading(false));
            });
        };

        browser.tabs.query({ active: true, currentWindow: true }).then(send);
      }}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Loading...
        </>
      ) : (
        "Send to Anki"
      )}
    </Button>
  );
}

export default SendToAnkiButton;
