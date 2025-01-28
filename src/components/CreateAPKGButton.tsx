import createAnkiFile from "@/lib/create-anki-file.ts";
import { Button } from "@/components/ui/button.tsx";
import Tab = browser.tabs.Tab;

function CreateAPKGButton() {
  const createApkgAction = async () => {
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
            throw new Error("Expected a Blob, but received a different type.");
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
    browser.tabs.query({ active: true, currentWindow: true }).then(send);
  };

  return (
    <Button variant={"secondary"} onClick={createApkgAction}>
      Export to Anki Deck File
    </Button>
  );
}

export default CreateAPKGButton;
