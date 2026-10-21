import type { ToolId } from "@/lib/store";

/**
 * Static teaser content for premium tools. The real tools are not part of
 * NoodleHub Lite — these are just mock-ups shown blurred in the preview.
 */

const WHITE = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E"];

function PianoMock({ active }: { active: number[] }) {
  return (
    <div className="flex gap-1 h-full">
      {WHITE.map((n, i) => (
        <div
          key={i}
          className={`flex-1 border-2 border-ink rounded-b flex items-end justify-center pb-1 text-[10px] font-bold ${
            active.includes(i) ? "bg-noodle-yellow" : "bg-white"
          }`}
        >
          {n}
        </div>
      ))}
    </div>
  );
}

function PillsMock({ items, label }: { items: string[]; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl uppercase mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <span
            key={i}
            className={`px-3 py-1.5 border-2 border-ink rounded-full text-sm font-bold ${
              i % 3 === 0 ? "bg-noodle-blue text-white" : i % 3 === 1 ? "bg-noodle-yellow" : "bg-noodle-pink"
            }`}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function CircleMock() {
  const keys = ["C", "G", "D", "A", "E", "B", "F♯", "D♭", "A♭", "E♭", "B♭", "F"];
  return (
    <div className="relative w-36 h-36 mx-auto rounded-full border-2 border-ink bg-noodle-blue/10">
      {keys.map((k, i) => {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        return (
          <span
            key={k}
            className="absolute text-xs font-bold w-6 h-6 -ml-3 -mt-3 rounded-full bg-white border border-ink flex items-center justify-center"
            style={{ left: `${50 + 42 * Math.cos(a)}%`, top: `${50 + 42 * Math.sin(a)}%` }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
}

function BigNumberMock({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="font-display text-7xl leading-none">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider mt-2">{unit}</div>
    </div>
  );
}

function FretboardMock() {
  return (
    <div className="h-full flex flex-col justify-between py-2 bg-amber-100 border-2 border-ink rounded-lg relative">
      {Array.from({ length: 6 }).map((_, s) => (
        <div key={s} className="h-px bg-ink relative">
          {[1, 3, 5, 7].map((f) =>
            (f + s) % 2 === 0 ? (
              <span
                key={f}
                className="absolute -top-2 w-4 h-4 rounded-full bg-noodle-blue border border-ink"
                style={{ left: `${f * 11}%` }}
              />
            ) : null,
          )}
        </div>
      ))}
    </div>
  );
}

export const LOCKED_CONTENT: Partial<
  Record<ToolId, { features: string[]; preview: React.ReactNode }>
> = {
  "chord-finder": {
    features: [
      "Click any combination of keys and get the chord name instantly",
      "Hear every chord with built-in audio playback",
      "Shows inversions, intervals, and alternate names",
    ],
    preview: <PianoMock active={[0, 2, 4, 6]} />,
  },
  "scale-finder": {
    features: [
      "Major, minor, all modes, plus exotic and world scales",
      "See every scale mapped on the piano",
      "Play scales up and down to train your ear",
    ],
    preview: <PillsMock label="D Dorian" items={["D", "E", "F", "G", "A", "B", "C"]} />,
  },
  "circle-of-fifths": {
    features: [
      "Click any key to see its scale, chords, and key signature",
      "Find relative minors and closely related keys at a glance",
      "Great for writing modulations and progressions",
    ],
    preview: <CircleMock />,
  },
  "key-finder": {
    features: [
      "Enter the notes you're playing and get the most likely key",
      "Ranked matches with confidence scores",
      "See the diatonic chords for each match",
    ],
    preview: <PillsMock label="Likely: G Major" items={["G", "B", "D", "F♯", "E minor", "C"]} />,
  },
  "interval-trainer": {
    features: [
      "Ear-training game: hear two notes, name the interval",
      "Pick which intervals to practice",
      "Track your score and streaks",
    ],
    preview: <PillsMock label="What interval?" items={["m3", "M3", "P4", "P5", "M6", "m7"]} />,
  },
  "bpm-tapper": {
    features: [
      "Tap along to any song to find its tempo",
      "Averages your taps for an accurate BPM",
      "Works with mouse, touch, or spacebar",
    ],
    preview: <BigNumberMock value="96" unit="Beats per minute" />,
  },
  "note-frequency": {
    features: [
      "Get the exact frequency in Hz for any note",
      "Convert any frequency to its nearest note and cents offset",
      "Hear the pitch to check your tuning",
    ],
    preview: <BigNumberMock value="440" unit="Hz · A4" />,
  },
  "note-converter": {
    features: [
      "Convert between scientific, Helmholtz, solfège, and MIDI",
      "Look up any note across every naming system",
      "Handy for reading scores and DAW work",
    ],
    preview: <PillsMock label="C4" items={["c'", "Do", "MIDI 60", "261.6 Hz"]} />,
  },
  fretboard: {
    features: [
      "Map any scale or chord across the whole fretboard",
      "Find every position and voicing",
      "Alternate tunings supported",
    ],
    preview: <FretboardMock />,
  },
};
