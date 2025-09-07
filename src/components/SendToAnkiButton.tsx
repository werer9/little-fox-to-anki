import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { useAnkiExport } from "@/hooks/use-anki-export.ts";
import { useAnkiExportStore } from "@/stores/anki-export-store.ts";

interface Props {
  vocabList: VocabListEntry[];
  disabled: boolean;
  isSelected: boolean;
}

function SendToAnkiButton({ vocabList, disabled, isSelected }: Props) {
  const { sendToAnki } = useAnkiExport();
  const { progress, total, status } = useAnkiExportStore();

  const sendToAnkiAction = () => {
    return sendToAnki(vocabList, isSelected);
  };

  return (
    <Button
      variant={"secondary"}
      disabled={disabled}
      onClick={sendToAnkiAction}
    >
      {status === "inprogress" ? (
        <>
          <Loader2 className="animate-spin" />
          Loading ({progress}/{total}) ...
        </>
      ) : (
        "Send to Anki"
      )}
    </Button>
  );
}

export default SendToAnkiButton;
