import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { ContentService } from "@/service/content-service.ts";

export class LittleFoxVocabContentService implements ContentService {
  getVocabList(document: Document): VocabListEntry[] {
    let tr = Array.from(document.getElementsByClassName("level3"));
    if (tr.length == 0) {
      tr = Array.from(document.getElementsByClassName("level1"));
    }

    return tr.map((row) => this.parseItem(row));
  }

  private parseItem(item: Element): VocabListEntry {
    return {
      isSelected: this.isSelected(item),
      audioUrl: this.getAudioUrl(item),
      chinese: this.getText(item, ".wordtxt .word_text"),
      pinyin: this.getText(item, ".wordtxt .word_sound"),
      english: this.getText(item, ".exm .mean_text"),
      exampleSentence: this.getExample(item),
    };
  }

  private getText(item: Element, selector: string): string {
    return item.querySelector(selector)?.textContent?.trim() || "";
  }

  private getExample(item: Element): string {
    return (
      item.querySelector<HTMLDivElement>(".simsun.example")?.textContent || ""
    );
  }

  private isSelected(item: Element): boolean {
    return (
      item.querySelector<HTMLInputElement>(
        ".ck .voca_cont_bt_che_box .wordCheck",
      )?.checked || false
    );
  }

  private getAudioUrl(item: Element): string | null {
    const match = item
      .querySelector(".snd")
      ?.querySelector<HTMLAnchorElement>("a")
      ?.href.match(/Play1\('([^?]*\.mp3[^']*)/);
    let audioLink = null;
    if (match && match[1]) {
      audioLink = `http:${match[1]}`;
    }

    return audioLink;
  }
}
