"use client";

import { useUI } from "@/lib/store";
import { Home } from "@/components/home";
import { Metronome } from "@/components/tools/metronome";
import { ChordProgressions } from "@/components/tools/chord-progressions";
import { GuitarChords } from "@/components/tools/guitar-chords";

export default function Page() {
  const tool = useUI((s) => s.activeTool);

  switch (tool) {
    case "metronome":
      return <Metronome />;
    case "chord-progressions":
      return <ChordProgressions />;
    case "guitar-chords":
      return <GuitarChords />;
    default:
      return <Home />;
  }
}
