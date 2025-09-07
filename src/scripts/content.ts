import { Command } from "@/types/command";
import { AnkiMessage } from "@/types/anki-message.ts";
import { LittleFoxVocabContentService } from "@/service/little-fox-vocab-content-service.ts";
import { ContentService } from "@/service/content-service.ts";

export function contentFunction(contentService: ContentService) {
  function isMessageRequest(message: unknown): message is AnkiMessage {
    return (
      typeof message === "object" && message !== null && "command" in message
    );
  }

  browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (!isMessageRequest(request)) {
      console.warn("Received unexpected message format:", request);
      return; // Exit early for invalid messages
    }

    console.log(request.command);
    switch (request.command) {
      case Command.GetVocabList:
        sendResponse(contentService.getVocabList(document));
        break;
      case Command.Error:
        alert(request.errorMessage);
        break;
      default:
        console.warn(`Unknown command: ${request.command}`);
    }

    return true;
  });
}

export function handleVocabularyClick(event: MouseEvent): void {
  const element = (event.target as HTMLElement).closest(".vocabulary");
  if (!element) return;

  const fc_id = element.getAttribute("fc_id");
  if (!fc_id) {
    console.error("fc_id attribute is missing on the .vocabulary element");
    return;
  }

  // Prevent the default behavior (e.g., opening a popup)
  event.preventDefault();
  event.stopPropagation();

  viewVocab(fc_id);
}

// Function to open the vocabulary in a new tab
export async function viewVocab(fcid: string): Promise<void> {
  // Construct the URL
  const url = `/en/supplement/vocabulary/${fcid}`;

  try {
    // Fallback to `window.open` if `browser.tabs.create` is not available
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
      console.error("Popup blocked or failed to open.");
      alert("Please allow popups for this site to open the vocabulary.");
    }
  } catch (error) {
    console.error("Failed to open new tab:", error);
    // Fallback to `window.open` if `browser.tabs.create` fails
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
      console.error("Popup blocked or failed to open.");
      alert("Please allow popups for this site to open the vocabulary.");
    }
  }
}

export function initializeContentScript(): void {
  // Attach the event listener to the document
  document.addEventListener("click", handleVocabularyClick, true);

  const contentService: ContentService = new LittleFoxVocabContentService();
  console.log(contentService.getVocabList(document));
  contentFunction(contentService);
}

if (typeof browser !== "undefined") {
  initializeContentScript();
}
