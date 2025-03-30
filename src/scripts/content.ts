interface MessageRequest {
  command: string;
  errorMessage?: string; // Optional field for the "error" command
}

export function getVocabList() {
  let tr = Array.from(document.getElementsByClassName("level3"));
  if (tr.length == 0) {
    tr = Array.from(document.getElementsByClassName("level1"));
  }
  return tr.map((item) => {
    const isSelected = item
      .querySelector(".ck")
      ?.querySelector(".voca_cont_bt_che_box")
      ?.querySelector<HTMLInputElement>(".wordCheck")?.checked;
    const match = item
      .querySelector(".snd")
      ?.querySelector<HTMLAnchorElement>("a")
      ?.href.match(/Play1\('([^?]*\.mp3[^']*)/);
    let audioLink = null;
    if (match && match[1]) {
      audioLink = `http:${match[1]}`;
    }
    const words = item
      .querySelector(".wordtxt")
      ?.querySelector(".word_text")?.textContent;
    const pinyin = item
      .querySelector(".wordtxt")
      ?.querySelector(".word_sound")?.textContent;
    const meaning = item
      .querySelector(".exm")
      ?.querySelector(".mean_text")?.textContent;
    const example = item
      .querySelector(".exm")
      ?.querySelector<HTMLDivElement>(".vc_example")?.innerText;

    return <VocabListEntry>{
      isSelected: isSelected,
      audioUrl: audioLink,
      chinese: words,
      pinyin: pinyin,
      english: meaning,
      exampleSentence: example,
    };
  });
}

console.log(getVocabList());

(() => {
  function isMessageRequest(message: unknown): message is MessageRequest {
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
      case "getVocabList":
        sendResponse(getVocabList());
        break;
      case "error":
        alert(request.errorMessage);
        break;
      default:
        console.warn(`Unknown command: ${request.command}`);
    }

    return true;
  });
})();

// content.ts

// Function to handle the click event
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

// Attach the event listener to the document
document.addEventListener("click", handleVocabularyClick, true);
