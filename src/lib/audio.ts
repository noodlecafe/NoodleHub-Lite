/**
 * Audio engine using Tone.js for instant browser playback.
 * Used for chord playback, metronome clicks, scale playback, etc.
 */

import * as Tone from "tone";

let synth: Tone.PolySynth | null = null;
let monoSynth: Tone.Synth | null = null;
let initialized = false;

export async function initAudio() {
  if (initialized) return;
  await Tone.start();
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.02,
      decay: 0.2,
      sustain: 0.3,
      release: 1,
    },
  }).toDestination();
  synth.volume.value = -8;
  monoSynth = new Tone.Synth({
    oscillator: { type: "square" },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.05,
    },
  }).toDestination();
  monoSynth.volume.value = -10;
  initialized = true;
}

export function isAudioReady() {
  return initialized;
}

/**
 * Play a list of notes simultaneously (a chord).
 * Notes should be in scientific pitch notation, e.g. ["C4", "E4", "G4"]
 */
export async function playChord(notes: string[], duration: string = "1n") {
  await initAudio();
  if (!synth) return;
  synth.triggerAttackRelease(notes, duration);
}

/**
 * Play a single note.
 */
export async function playNote(note: string, duration: string = "8n") {
  await initAudio();
  if (!synth) return;
  synth.triggerAttackRelease(note, duration);
}

/**
 * Play a sequence of notes/chords one after another.
 * @param items - array of either notes ("C4") or chord arrays (["C4","E4"])
 * @param interval - time between items (Tone.js notation, e.g. "4n" for quarter note)
 */
export async function playSequence(
  items: (string | string[])[],
  interval: string = "4n",
  noteDuration?: string,
) {
  await initAudio();
  if (!synth) return;
  const now = Tone.now();
  items.forEach((item, i) => {
    const time = now + i * Tone.Time(interval).toSeconds();
    const dur = noteDuration || interval;
    if (Array.isArray(item)) {
      synth!.triggerAttackRelease(item, dur, time);
    } else {
      synth!.triggerAttackRelease(item, dur, time);
    }
  });
}

/**
 * Schedule a metronome click. Returns a stop function.
 */
export function startMetronome(
  bpm: number,
  beatsPerMeasure: number = 4,
  onBeat?: (beat: number) => void,
): () => void {
  // Start audio if not already
  initAudio().then(() => {
    if (!monoSynth) return;
    Tone.getTransport().bpm.value = bpm;
    let beatCount = 0;
    // Clear any previous schedule
    Tone.getTransport().cancel(0);
    Tone.getTransport().scheduleRepeat((time) => {
      const isDownbeat = beatCount % beatsPerMeasure === 0;
      monoSynth!.volume.value = isDownbeat ? -6 : -12;
      monoSynth!.triggerAttackRelease(isDownbeat ? "C5" : "C4", "32n", time);
      // Use draw for UI sync
      Tone.getDraw().schedule(() => {
        if (onBeat) onBeat(beatCount % beatsPerMeasure);
      }, time);
      beatCount++;
    }, "4n");
    Tone.getTransport().start();
  });

  // Return stop function
  return () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel(0);
  };
}

export function stopMetronome() {
  Tone.getTransport().stop();
  Tone.getTransport().cancel(0);
}

export function setMetronomeBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}

/**
 * Metronome tick using a one-off click (not transport-scheduled).
 * Used by tools that drive their own timer.
 */
export async function clickTick(accent: boolean = false) {
  await initAudio();
  if (!monoSynth) return;
  monoSynth.volume.value = accent ? -6 : -12;
  monoSynth.triggerAttackRelease(accent ? "C5" : "C4", "32n");
}

/**
 * Convert a MIDI note number to scientific pitch notation.
 */
export function midiToNote(midi: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(midi / 12) - 1;
  return names[midi % 12] + octave;
}

/**
 * Convert a frequency in Hz to the nearest note name (scientific).
 */
export function freqToNoteName(freq: number): {
  note: string;
  midi: number;
  cents: number;
} {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  const exactFreq = 440 * Math.pow(2, (midi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(freq / exactFreq));
  return { note: midiToNote(midi), midi, cents };
}

/**
 * Convert scientific note name to frequency.
 */
export function noteNameToFreq(note: string): number {
  return Tone.Frequency(note).toFrequency();
}
