/**
 * Audio engine using Tone.js samplers for real-instrument playback.
 * Piano: Salamander Grand Piano (Alexander Holm, CC-BY 3.0)
 * Guitar: acoustic guitar from tonejs-instruments (Nicholaus Brosowsky, CC-BY 3.0)
 * Samples live in /public/samples and are pitch-shifted to fill in the gaps.
 */

import * as Tone from "tone";

export type Instrument = "piano" | "guitar";

const PIANO_NOTES = ["C", "Ds", "Fs", "A"].flatMap((n) => [1, 2, 3, 4, 5, 6].map((o) => `${n}${o}`)).concat("C7");
const GUITAR_NOTES = ["E2", "G2", "As2", "Cs3", "E3", "G3", "As3", "Cs4", "E4", "G4", "As4", "Cs5"];

const toUrls = (notes: string[]) =>
  Object.fromEntries(notes.map((n) => [n.replace("s", "#"), `${n}.mp3`]));

let samplers: Record<Instrument, Tone.Sampler> | null = null;
let woodblock: Tone.MembraneSynth | null = null;
let loading: Promise<void> | null = null;

export function initAudio(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      await Tone.start();
      // A touch of room reverb so notes bloom instead of sounding dry.
      const reverb = new Tone.Reverb({ decay: 2.4, wet: 0.22 }).toDestination();
      samplers = {
        piano: new Tone.Sampler({ urls: toUrls(PIANO_NOTES), baseUrl: "/samples/piano/", release: 1.2 }).connect(reverb),
        guitar: new Tone.Sampler({ urls: toUrls(GUITAR_NOTES), baseUrl: "/samples/guitar/", release: 0.8 }).connect(reverb),
      };
      samplers.piano.volume.value = 0;
      samplers.guitar.volume.value = 0;
      woodblock = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.0005, decay: 0.07, sustain: 0, release: 0.02 },
      }).toDestination();
      await Tone.loaded();
    })();
  }
  return loading;
}

export function isAudioReady() {
  return samplers !== null;
}

/**
 * Play a list of notes together (a chord), e.g. ["C4", "E4", "G4"].
 * Guitar chords are strummed low-to-high; piano chords get a slight human roll.
 */
export async function playChord(notes: string[], duration: string = "1n", instrument: Instrument = "piano", time?: number) {
  await initAudio();
  const s = samplers![instrument];
  const start = time ?? Tone.now();
  const spread = instrument === "guitar" ? 0.035 : 0.008;
  notes.forEach((n, i) => s.triggerAttackRelease(n, duration, start + i * spread, instrument === "guitar" ? 0.85 : 0.7));
}

/**
 * Play a single note.
 */
export async function playNote(note: string, duration: string = "8n", instrument: Instrument = "piano") {
  await initAudio();
  samplers![instrument].triggerAttackRelease(note, duration, undefined, 0.75);
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
  instrument: Instrument = "piano",
) {
  await initAudio();
  const now = Tone.now();
  const step = Tone.Time(interval).toSeconds();
  items.forEach((item, i) => {
    const notes = Array.isArray(item) ? item : [item];
    playChord(notes, noteDuration || interval, instrument, now + i * step);
  });
}

/**
 * Woodblock-style metronome click. Pass a Transport time when scheduling.
 */
export async function clickTick(accent: boolean = false, time?: number) {
  await initAudio();
  woodblock!.volume.value = accent ? -2 : -9;
  woodblock!.triggerAttackRelease(accent ? "A5" : "E5", "32n", time);
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
