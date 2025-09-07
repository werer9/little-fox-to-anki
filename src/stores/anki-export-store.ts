import { create } from "zustand";

interface AnkiExportStore {
  total: number;
  progress: number;
  status: "idle" | "inprogress" | "complete" | "error";
  error: string | null;
  setProgress: (progress: number, total: number) => void;
  setStatus: (status: AnkiExportStore["status"], error?: string) => void;
  reset: () => void;
}

export const useAnkiExportStore = create<AnkiExportStore>((set) => ({
  total: 0,
  progress: 0,
  status: "idle",
  error: null,
  setProgress: (progress, total) => set({ progress: progress, total: total }),
  setStatus: (status, error) => set({ status: status, error: error }),
  reset: () => set({ total: 0, progress: 0, status: "idle", error: null }),
}));
