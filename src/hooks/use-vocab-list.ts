import { BrowserService } from "@/service/browser-service.ts";
import { VocabListEntry } from "@/types/vocab-list-entry.ts";
import { Command } from "@/types/command.ts";
import useSWR, { SWRConfiguration } from "swr";
import { PolyfillBrowserService } from "@/service/polyfill-browser-service.ts";

const config: SWRConfiguration = {
  fallbackData: [],
  revalidateOnFocus: false,
};

const fetcher = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [_key, browserService]: [string, BrowserService],
): Promise<void | VocabListEntry[]> => {
  const vocabList = await browserService.sendMessage(Command.GetVocabList);
  if (vocabList === undefined) {
    throw new Error("Could not fetch vocab list");
  }

  return vocabList;
};

export const useVocabList = (browserService?: BrowserService) => {
  const service = browserService || new PolyfillBrowserService();

  const { data, error, isLoading, mutate } = useSWR(
    ["getVocabList", service],
    fetcher,
    config,
  );

  return {
    vocabList: data,
    error: error instanceof Error ? error.message : String(error),
    isLoading: isLoading,
    mutate,
  };
};
