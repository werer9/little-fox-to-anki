import { Command } from "@/types/command.ts";

export interface AnkiMessage {
  command: Command;
  errorMessage?: string;
}
