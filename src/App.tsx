import { Button } from "@/components/ui/button";
import "./App.css";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import Tab = browser.tabs.Tab;
import createAnkiFile from "@/lib/create-anki-file.ts";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import SendToAnkiButton from "@/components/SendToAnkiButton.tsx";

function App() {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="block space-y-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exportSelected"
              onCheckedChange={(checked) => {
                setIsSelected(checked === "indeterminate" ? false : checked);
              }}
            />
            <label
              htmlFor="exportSelected"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Only export selected vocabulary
            </label>
          </div>
          <div className="grid grid-cols-1 space-y-2">
            <Button
              variant={"secondary"}
              onClick={async () => {
                const send = (tabs: Tab[]) => {
                  browser.tabs
                    .sendMessage(tabs[0].id as number, {
                      command: "getVocabList",
                    })
                    .then(async (r: VocabListEntry[]) => {
                      const pkg = await createAnkiFile(r);
                      const result = await pkg.writeToFile();
                      console.log(pkg);
                      let zip: Blob;
                      if (result instanceof Blob) {
                        zip = result;
                        // Use `zip` as a Blob
                      } else {
                        throw new Error(
                          "Expected a Blob, but received a different type.",
                        );
                      }

                      browser.downloads
                        .download({
                          url: URL.createObjectURL(zip),
                          filename: "LittleFox.apkg",
                          conflictAction: "uniquify",
                        })
                        .then((r) => console.log(r.toString()));
                    });
                };
                browser.tabs
                  .query({ active: true, currentWindow: true })
                  .then(send);
              }}
            >
              Export to Anki Deck File
            </Button>
            <SendToAnkiButton isSelected={isSelected} />
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
