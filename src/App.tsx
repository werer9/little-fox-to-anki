import { Button } from "@/components/ui/button";
import "./App.css";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import Tab = browser.tabs.Tab;
import createAnkiFile from "@/create-anki-file.ts";

function App() {
  return (
    <>
      <div className="block space-y-1">
        <div className="flex items-center space-x-2">
          <Checkbox id="exportSelected" />
          <label
            htmlFor="exportSelected"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Only export selected vocabulary
          </label>
        </div>
        <div>
          <Button
            onClick={async () => {
              const send = (tabs: Tab[]) => {
                browser.tabs
                  .sendMessage(tabs[0].id as number, {
                    test: "test",
                  })
                  .then(async (r: VocabListEntry[]) => {
                      const pkg = await createAnkiFile(r)
                      const result = await pkg.writeToFile();
                      console.log(pkg)
                      let zip: Blob
                      if (result instanceof Blob) {
                          zip = result;
                          // Use `zip` as a Blob
                      } else {
                          throw new Error("Expected a Blob, but received a different type.");
                      }

                      browser.downloads.download({
                          url: URL.createObjectURL(zip),
                          filename: "LittleFox.apkg",
                          conflictAction: "uniquify",
                      }).then(r => console.log(r.toString()));
                  });
              };
              browser.tabs
                .query({ active: true, currentWindow: true })
                .then(send);
            }}
          >
            Test
          </Button>
        </div>
      </div>
    </>
  );
}

export default App;
