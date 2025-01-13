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
    browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        console.log(request.test);
        sendResponse(getVocabList());
    });
})();

