/**
 * NoodleHub PyTheory client
 * Wraps calls to PyTheory via the Next.js /api/pytheory route,
 * which spawns a Python subprocess on each request.
 *
 * All responses are cached in-memory on the server for 5 minutes,
 * so repeated calls to the same scale/key are fast.
 */

async function callPyTheory<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/pytheory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fn, args: args || {} }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PyTheory error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface NoteInfo {
  name: string;
  scientific: string;
  helmholtz: string;
  midi: number;
  frequency: number;
  solfege: string;
  letter: string;
  is_sharp: boolean;
  is_flat: boolean;
  is_natural: boolean;
  pitch_class: number;
}

export interface ChordNote {
  name: string;
  scientific: string;
  midi: number | null;
  frequency: number | null;
}

export interface ChordInfo {
  name: string;
  notes: ChordNote[];
  input?: string[];
}

export interface KeyInfo {
  tonic: string;
  mode: string;
  note_names: string[];
  chords: string[];
  seventh_chords: string[];
  signature: { sharps: number; flats: number };
  key?: string;
}

export interface ScaleInfo {
  tonic: string;
  mode: string;
  note_names: string[];
  notes: NoteInfo[];
  chords: string[];
  seventh_chords: string[];
  signature: { sharps: number; flats: number };
}

export interface ProgressionInfo {
  tonic: string;
  mode: string;
  numerals?: string[];
  name?: string;
  chords: ChordInfo[];
}

export type PyTheoryService = {
  health: () => Promise<{ status: string; pytheory_version: string }>;
  availableScales: () => Promise<{ scales: string[] }>;
  getScale: (tonic: string, mode: string) => Promise<ScaleInfo>;
  allKeys: () => Promise<{ keys: KeyInfo[] }>;
  detectKey: (notes: string[]) => Promise<KeyInfo & { key: string | null }>;
  circleOfFifths: () => Promise<{
    major: [string, number][];
    minor: [string, number][];
    explanation: string;
  }>;
  commonProgressions: (tonic: string, mode: string) => Promise<ProgressionInfo>;
  buildProgression: (
    tonic: string,
    mode: string,
    numerals: string[],
  ) => Promise<ProgressionInfo>;
  identifyChord: (notes: string[]) => Promise<ChordInfo>;
  noteFrequency: (note: string) => Promise<NoteInfo>;
  noteInfo: (note: string) => Promise<NoteInfo>;
  noteConvert: (note: string) => Promise<{
    input: string;
    scientific: string;
    helmholtz: string;
    solfege: string;
    letter: string;
    midi: number;
    frequency: number;
    pitch_class: number;
  }>;
  noteFromMidi: (midi: number) => Promise<NoteInfo>;
  noteFromFrequency: (freq: number) => Promise<{
    input_frequency: number;
    note: string;
    scientific: string;
    midi: number;
    actual_frequency: number;
    cents_off: number;
  }>;
};

export const pytheory: PyTheoryService = {
  health: () => callPyTheory("health"),
  availableScales: () => callPyTheory("available_scales"),
  getScale: (tonic, mode) => callPyTheory("get_scale", { tonic, mode }),
  allKeys: () => callPyTheory("all_keys"),
  detectKey: (notes) => callPyTheory("detect_key", { notes }),
  circleOfFifths: () => callPyTheory("circle_of_fifths"),
  commonProgressions: (tonic, mode) =>
    callPyTheory("common_progressions", { tonic, mode }),
  buildProgression: (tonic, mode, numerals) =>
    callPyTheory("build_progression", { tonic, mode, numerals }),
  identifyChord: (notes) => callPyTheory("identify_chord", { notes }),
  noteFrequency: (note) => callPyTheory("note_info", { note }),
  noteInfo: (note) => callPyTheory("note_info", { note }),
  noteConvert: (note) => callPyTheory("note_convert", { note }),
  noteFromMidi: (midi) => callPyTheory("note_from_midi", { midi }),
  noteFromFrequency: (freq) => callPyTheory("note_from_frequency", { freq }),
};
