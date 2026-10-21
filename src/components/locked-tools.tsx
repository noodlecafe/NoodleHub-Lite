import type { ToolId } from "@/lib/store";

/**
 * Teaser content for premium tools. The real tools are not part of
 * NoodleHub Lite - previews are recorded demo clips in public/previews/<id>.mp4.
 */

export const LOCKED_CONTENT: Partial<Record<ToolId, { features: string[] }>> = {
  "chord-finder": {
    features: [
      "Click any combination of keys and get the chord name instantly",
      "Hear every chord with built-in audio playback",
      "One-click presets for common chords, with each note's frequency",
    ],
  },
  "scale-finder": {
    features: [
      "Major, minor, all seven modes, and harmonic minor in any key",
      "See every scale mapped on the piano",
      "Play scales back and see the diatonic chords for each one",
    ],
  },
  "circle-of-fifths": {
    features: [
      "Click any key to see its scale, chords, and key signature",
      "Find relative minors and closely related keys at a glance",
      "Great for writing modulations and progressions",
    ],
  },
  "key-finder": {
    features: [
      "Enter the notes you're playing and get the most likely key",
      "Shows the key signature and how many of your notes fit",
      "See the full scale for the detected key",
    ],
  },
  "interval-trainer": {
    features: [
      "Ear-training game: hear two notes, melodic or harmonic, and name the interval",
      "Three difficulty levels, up to all 13 intervals",
      "Track your score and accuracy as you go",
    ],
  },
  "bpm-tapper": {
    features: [
      "Tap along to any song to find its tempo",
      "Averages your taps for an accurate BPM",
      "Works with mouse, touch, or spacebar",
    ],
  },
  "note-frequency": {
    features: [
      "Get the exact frequency in Hz for any note",
      "Convert any frequency to its nearest note and cents offset",
      "Hear the pitch to check your tuning",
    ],
  },
  "note-converter": {
    features: [
      "Convert between scientific, Helmholtz, solfège, and MIDI",
      "Look up any note across every naming system",
      "Handy for reading scores and DAW work",
    ],
  },
  fretboard: {
    features: [
      "Map any scale or chord across the whole fretboard",
      "Switch to chords: majors, minors, 7ths, sus, diminished and more",
      "Spot root notes instantly across all six strings",
    ],
  },
};
