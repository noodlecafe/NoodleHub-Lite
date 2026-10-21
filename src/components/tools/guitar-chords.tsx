"use client";

import { useState, useMemo } from "react";
import { Guitar, Play, Volume2 } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { playChord, initAudio } from "@/lib/audio";
import { cn } from "@/lib/utils";

// Common guitar chord shapes (open-position chords)
// frets: -1 = mute, 0 = open, 1+ = fretted. 6 strings index 0 (low E) to 5 (high E)
interface ChordShape {
  name: string;
  frets: number[];
  fingers?: number[];
  baseFret?: number;
  barres?: { fret: number; from: number; to: number }[];
}

const CHORD_LIBRARY: Record<string, ChordShape[]> = {
  C: [
    {
      name: "C major",
      frets: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
    },
    {
      name: "Cmaj7",
      frets: [-1, 3, 2, 0, 0, 0],
    },
    {
      name: "C7",
      frets: [-1, 3, 2, 3, 1, 0],
    },
    {
      name: "C minor",
      frets: [-1, 3, 5, 5, 4, 3],
      baseFret: 1,
      barres: [{ fret: 3, from: 5, to: 1 }],
    },
  ],
  D: [
    {
      name: "D major",
      frets: [-1, -1, 0, 2, 3, 2],
    },
    {
      name: "Dmaj7",
      frets: [-1, -1, 0, 2, 2, 2],
    },
    {
      name: "D7",
      frets: [-1, -1, 0, 2, 1, 2],
    },
    {
      name: "D minor",
      frets: [-1, -1, 0, 2, 3, 1],
    },
    {
      name: "Dm7",
      frets: [-1, -1, 0, 2, 1, 1],
    },
  ],
  E: [
    {
      name: "E major",
      frets: [0, 2, 2, 1, 0, 0],
    },
    {
      name: "Emaj7",
      frets: [0, 2, 1, 1, 0, 0],
    },
    {
      name: "E7",
      frets: [0, 2, 0, 1, 0, 0],
    },
    {
      name: "E minor",
      frets: [0, 2, 2, 0, 0, 0],
    },
    {
      name: "Em7",
      frets: [0, 2, 0, 0, 0, 0],
    },
  ],
  F: [
    {
      name: "F major",
      frets: [1, 3, 3, 2, 1, 1],
      barres: [{ fret: 1, from: 5, to: 0 }],
    },
    {
      name: "Fmaj7",
      frets: [-1, -1, 3, 2, 1, 0],
    },
    {
      name: "F7",
      frets: [1, 3, 1, 2, 1, 1],
      barres: [{ fret: 1, from: 5, to: 0 }],
    },
    {
      name: "F minor",
      frets: [1, 3, 3, 1, 1, 1],
      barres: [{ fret: 1, from: 5, to: 0 }],
    },
  ],
  G: [
    {
      name: "G major",
      frets: [3, 2, 0, 0, 0, 3],
    },
    {
      name: "Gmaj7",
      frets: [3, 2, 0, 0, 0, 2],
    },
    {
      name: "G7",
      frets: [3, 2, 0, 0, 0, 1],
    },
    {
      name: "G minor",
      frets: [3, 5, 5, 3, 3, 3],
      barres: [{ fret: 3, from: 5, to: 0 }],
    },
  ],
  A: [
    {
      name: "A major",
      frets: [-1, 0, 2, 2, 2, 0],
    },
    {
      name: "Amaj7",
      frets: [-1, 0, 2, 1, 2, 0],
    },
    {
      name: "A7",
      frets: [-1, 0, 2, 0, 2, 0],
    },
    {
      name: "A minor",
      frets: [-1, 0, 2, 2, 1, 0],
    },
    {
      name: "Am7",
      frets: [-1, 0, 2, 0, 1, 0],
    },
  ],
  B: [
    {
      name: "B major",
      frets: [-1, 2, 4, 4, 4, 2],
      barres: [{ fret: 2, from: 5, to: 1 }],
    },
    {
      name: "B7",
      frets: [-1, 2, 1, 2, 0, 2],
    },
    {
      name: "B minor",
      frets: [-1, 2, 4, 4, 3, 2],
      barres: [{ fret: 2, from: 5, to: 1 }],
    },
    {
      name: "Bm7",
      frets: [-1, 2, 0, 2, 0, 2],
    },
  ],
};

const ROOT_NOTES = ["C", "D", "E", "F", "G", "A", "B"];

// Standard tuning string names from low to high
const STRING_TUNINGS = ["E2", "A2", "D3", "G3", "B3", "E4"];
const STRING_PITCH_CLASSES = [4, 9, 2, 7, 11, 4]; // E, A, D, G, B, E (0-indexed pitch classes)

// Compute the note name at a given string (0-5) and fret
function fretToNote(stringIdx: number, fret: number): string {
  if (fret === -1) return "";
  const pc = (STRING_PITCH_CLASSES[stringIdx] + fret) % 12;
  const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return NOTE_NAMES[pc];
}

function fretToMidi(stringIdx: number, fret: number): number {
  if (fret === -1) return -1;
  // MIDI: E2 = 40, A2 = 45, D3 = 50, G3 = 55, B3 = 59, E4 = 64
  const baseMidis = [40, 45, 50, 55, 59, 64];
  return baseMidis[stringIdx] + fret;
}

export function GuitarChords() {
  const [selectedRoot, setSelectedRoot] = useState("C");
  const [selectedChord, setSelectedChord] = useState<ChordShape | null>(null);

  const chords = useMemo(() => CHORD_LIBRARY[selectedRoot] || [], [selectedRoot]);

  // Auto-select first chord when root changes
  useMemo(() => {
    if (chords.length > 0) {
      setSelectedChord(chords[0]);
    }
  }, [chords]);

  const handlePlayChord = async () => {
    if (!selectedChord) return;
    await initAudio();
    const notes = selectedChord.frets
      .map((f, stringIdx) => {
        const midi = fretToMidi(stringIdx, f);
        if (midi < 0) return null;
        const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const pc = midi % 12;
        const octave = Math.floor(midi / 12) - 1;
        return NOTE_NAMES[pc] + octave;
      })
      .filter((n): n is string => n !== null);
    // Strummed low-to-high on the acoustic guitar
    await playChord(notes, "1n", "guitar");
  };

  return (
    <ToolShell
      toolId="guitar-chords"
      title="Guitar Chord Library"
      description="Browse the most common guitar chord shapes. Pick a root note, choose a chord quality, see the diagram, and hear how it sounds. Great for beginners learning their first chords."
      icon={<Guitar className="h-7 w-7 text-ink" />}
      accent="yellow"
    >
      <div className="space-y-6">
        {/* Root note selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2 block">
            Root Note
          </label>
          <div className="flex flex-wrap gap-1">
            {ROOT_NOTES.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoot(r)}
                className={cn(
                  "px-4 py-2 border-2 border-ink rounded-lg font-display text-lg uppercase transition-colors",
                  selectedRoot === r ? "bg-noodle-yellow" : "bg-white hover:bg-cream-deep",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Chord selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2 block">
            Chord Quality
          </label>
          <div className="flex flex-wrap gap-2">
            {chords.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedChord(c)}
                className={cn(
                  "px-4 py-2 border-2 border-ink rounded-lg text-sm font-bold transition-colors",
                  selectedChord?.name === c.name ? "bg-noodle-blue text-white" : "bg-white hover:bg-cream-deep",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chord diagram */}
        {selectedChord && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border-2 border-ink rounded-xl p-5 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-2xl uppercase">{selectedChord.name}</div>
                <Button onClick={handlePlayChord} className="noodle-btn" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
              </div>
              <ChordDiagram chord={selectedChord} />
            </div>

            {/* Notes in chord */}
            <div className="border-2 border-ink rounded-xl p-5 bg-cream-deep">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">
                Notes in this shape (low → high)
              </div>
              <div className="space-y-2">
                {selectedChord.frets.map((f, stringIdx) => {
                  const note = fretToNote(stringIdx, f);
                  const midi = fretToMidi(stringIdx, f);
                  const octave = midi >= 0 ? Math.floor(midi / 12) - 1 : null;
                  return (
                    <div
                      key={stringIdx}
                      className="flex items-center gap-3 bg-white rounded-lg p-2 border border-ink/30"
                    >
                      <div className="text-xs font-bold uppercase text-ink-soft w-12">
                        {STRING_TUNINGS[stringIdx]}
                      </div>
                      <div className="text-xs text-ink-soft">→</div>
                      <div className="font-bold w-8 text-center">
                        {f === -1 ? "×" : f}
                      </div>
                      <div className="text-xs text-ink-soft">fret</div>
                      <div className="ml-auto font-display text-base">
                        {note || "muted"}
                        {octave !== null && note && (
                          <span className="text-xs text-ink-soft ml-1">
                            {octave}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-ink/30">
                <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">
                  How to read the diagram
                </div>
                <ul className="text-xs text-ink-soft space-y-1">
                  <li><strong>×</strong> = string is muted (don't play)</li>
                  <li><strong>○</strong> above the string = open string (play with no finger)</li>
                  <li>Numbers in dots = which finger to use (1=index, 4=pinky)</li>
                  <li>The thick top line is the nut (open position). If you see a "1fr" label, the diagram starts at that fret.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}

function ChordDiagram({ chord }: { chord: ChordShape }) {
  const baseFret = chord.baseFret || 1;
  const maxFret = Math.max(...chord.frets.filter((f) => f > 0), baseFret + 4);
  const fretCount = Math.max(5, maxFret - baseFret + 1);

  // Diagram dimensions (SVG units)
  const width = 240;
  const height = 280;
  const numStrings = 6;
  const numFrets = fretCount;
  const padX = 30;
  const padY = 40;
  const stringSpacing = (width - 2 * padX) / (numStrings - 1);
  const fretSpacing = (height - 2 * padY) / numFrets;

  // Whether to show "open" markers above the nut
  const showNut = baseFret === 1;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[260px] mx-auto">
      <defs>
        <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Nut (thick line at top if open position) */}
      {showNut && (
        <line
          x1={padX - 4}
          y1={padY}
          x2={width - padX + 4}
          y2={padY}
          stroke="#F4EEE6"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}

      {/* Frets */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={padX}
          y1={padY + i * fretSpacing}
          x2={width - padX}
          y2={padY + i * fretSpacing}
          stroke="#F4EEE6"
          strokeOpacity="0.75"
          strokeWidth="1.5"
        />
      ))}

      {/* Strings */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={padX + i * stringSpacing}
          y1={padY}
          x2={padX + i * stringSpacing}
          y2={padY + numFrets * fretSpacing}
          stroke="#F4EEE6"
          strokeOpacity="0.75"
          strokeWidth="1.5"
        />
      ))}

      {/* Open/mute markers above the nut */}
      {chord.frets.map((f, i) => {
        if (f > 0) return null;
        const x = padX + i * stringSpacing;
        const y = padY - 14;
        return f === 0 ? (
          <circle
            key={`open-${i}`}
            cx={x}
            cy={y}
            r="6"
            fill="none"
            stroke="#F4EEE6"
            strokeWidth="2"
          />
        ) : (
          <text
            key={`mute-${i}`}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="#F4EEE6"
          >
            ×
          </text>
        );
      })}

      {/* Barres */}
      {chord.barres?.map((b, i) => {
        const x1 = padX + b.from * stringSpacing;
        const x2 = padX + b.to * stringSpacing;
        const y = padY + (b.fret - baseFret + 0.5) * fretSpacing;
        return (
          <rect
            key={`barre-${i}`}
            x={Math.min(x1, x2) - 8}
            y={y - 8}
            width={Math.abs(x2 - x1) + 16}
            height="16"
            rx="8"
            fill="#F7E35E"
            filter="url(#dot-glow)"
          />
        );
      })}

      {/* Finger dots */}
      {chord.frets.map((f, i) => {
        if (f <= 0) return null;
        const x = padX + i * stringSpacing;
        const y = padY + (f - baseFret + 0.5) * fretSpacing;
        const finger = chord.fingers?.[i] || 1;
        const hasBarre = chord.barres?.some((b) => b.fret === f && i >= b.to && i <= b.from);
        if (hasBarre) return null; // barre already drawn
        return (
          <g key={`dot-${i}`}>
            <circle
              cx={x}
              cy={y}
              r="9"
              fill="#F7E35E"
              filter="url(#dot-glow)"
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#17171B"
            >
              {finger}
            </text>
          </g>
        );
      })}

      {/* Fret position label if not open position */}
      {baseFret > 1 && (
        <text
          x={width - padX + 12}
          y={padY + fretSpacing * 0.7}
          fontSize="11"
          fontWeight="700"
          fill="#F4EEE6"
        >
          {baseFret}fr
        </text>
      )}

      {/* String labels (string names above diagram) */}
      {STRING_TUNINGS.map((s, i) => (
        <text
          key={`label-${i}`}
          x={padX + i * stringSpacing}
          y={height - 8}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="#A9A5B5"
        >
          {s[0]}
        </text>
      ))}
    </svg>
  );
}
