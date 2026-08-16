import { create } from "zustand";

export const AI_CHAT_MIN_WIDTH = 300;
export const AI_CHAT_MAX_WIDTH = 560;
export const AI_CHAT_DEFAULT_WIDTH = 360;
export const AI_CHAT_RAIL_WIDTH = 44;

type AiChatStore = {
  isOpen: boolean;
  width: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setWidth: (width: number) => void;
  resetWidth: () => void;
};

export const useAiChat = create<AiChatStore>((set, get) => ({
  isOpen: true,
  width: AI_CHAT_DEFAULT_WIDTH,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set({ isOpen: !get().isOpen }),
  setWidth: (width) =>
    set({
      width: Math.min(AI_CHAT_MAX_WIDTH, Math.max(AI_CHAT_MIN_WIDTH, width)),
    }),
  resetWidth: () => set({ width: AI_CHAT_DEFAULT_WIDTH }),
}));
