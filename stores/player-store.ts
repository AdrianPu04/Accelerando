import { create } from "zustand";

export interface PlayerStore {
  pieceId: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  activeAnnotationId: string | null;

  setPiece: (pieceId: string) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setActiveAnnotationId: (id: string | null) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  pieceId: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  activeAnnotationId: null,
  setPiece: (pieceId) => set({ pieceId }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setActiveAnnotationId: (activeAnnotationId) => set({ activeAnnotationId }),
  reset: () =>
    set({
      pieceId: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      activeAnnotationId: null,
    }),
}));
