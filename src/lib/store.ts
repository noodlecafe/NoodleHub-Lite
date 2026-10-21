/**
 * NoodleHub UI state - manages which tool is currently active,
 * displayed on a single page (SPA-style) instead of using routes.
 */

import { create } from "zustand";

export type ToolId =
  | "home"
  | "chord-finder"
  | "scale-finder"
  | "circle-of-fifths"
  | "metronome"
  | "bpm-tapper"
  | "note-frequency"
  | "chord-progressions"
  | "interval-trainer"
  | "guitar-chords"
  | "fretboard"
  | "key-finder"
  | "note-converter";

interface UIState {
  activeTool: ToolId;
  setTool: (tool: ToolId) => void;
  goHome: () => void;
}

export const useUI = create<UIState>((set) => ({
  activeTool: "home",
  setTool: (tool) => set({ activeTool: tool }),
  goHome: () => set({ activeTool: "home" }),
}));
