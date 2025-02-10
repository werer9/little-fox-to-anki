interface MessageRequest {
  command: string;
  errorMessage?: string; // Optional field for the "error" command
}

function getVocabList() {
  const tr = Array.from(document.getElementsByClassName("level3"));
  return tr.map((item) => {
    const isSelected = item
      .querySelector(".ck")
      ?.querySelector(".voca_cont_bt_che_box")
      ?.querySelector<HTMLInputElement>(".wordCheck")?.checked;
    const match = item
      .querySelector(".snd")
      ?.querySelector<HTMLAnchorElement>("a")
      ?.href.match(/'([^']*)'/);
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
