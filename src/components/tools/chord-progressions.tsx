"use client";

import { useState, useEffect, useCallback } from "react";
import { Repeat, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { pytheory, type ProgressionInfo } from "@/lib/pytheory";
import { playSequence, playChord, initAudio } from "@/lib/audio";
import { cn } from "@/lib/utils";

const TONICS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];

const POPULAR_PROGRESSION_NAMES: { name: string; description: string }[] = [
  { name: "I-V-vi-IV", description: "The 'pop punk' progression, used in countless hits" },
  { name: "I-IV-V-I", description: "Classic rock 'n' roll / blues turnaround" },
  { name: "I-vi-IV-V", description: "The '50s' doo-wop progression" },
  { name: "vi-IV-I-V", description: "Same four chords, starting on the relative minor" },
  { name: "I-IV-vi-V", description: "Sensitive and hopeful, a modern pop favourite" },
];

export function ChordProgressions() {
  const [tonic, setTonic] = useState("C");
  const [mode, setMode] = useState<"major" | "minor">("major");
  const [data, setData] = useState<ProgressionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await pytheory.commonProgressions(tonic, mode);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tonic, mode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const playProgression = useCallback(async (chords: ProgressionInfo["chords"]) => {
    setIsPlaying(true);
    await initAudio();
    const items = chords.map((c) => c.notes.map((n) => n.scientific));
    let i = 0;
    setPlayingIdx(0);
    const interval = setInterval(() => {
      i++;
      if (i >= items.length) {
        clearInterval(interval);
        setPlayingIdx(-1);
        setIsPlaying(false);
        return;
      }
      setPlayingIdx(i);
    }, 800);
    // Play sequence with Tone.js
    const flatNotes = items.flat();
    // Play each chord for ~0.8s
    for (let idx = 0; idx < items.length; idx++) {
      const chord = items[idx];
      setTimeout(() => playChord(chord, "4n"), idx * 800);
    }
  }, []);

  const playSingleChord = async (chord: ProgressionInfo["chords"][number]) => {
    await initAudio();
    await playChord(chord.notes.map((n) => n.scientific), "1n");
  };

  return (
    <ToolShell
      toolId="chord-progressions"
      title="Chord Progressions"
      description="Browse common chord progressions in any key, hear them play back, and find your next songwriting idea. Powered by PyTheory's harmonic analysis."
      icon={<Repeat className="h-7 w-7 text-white" />}
      accent="blue"
    >
      <div className="space-y-6">
        {/* Selectors */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2 block">
              Key (Tonic)
            </label>
            <div className="flex flex-wrap gap-1">
              {TONICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTonic(t)}
                  className={cn(
                    "px-3 py-1.5 border-2 border-ink rounded-lg text-sm font-bold transition-colors",
                    tonic === t ? "bg-noodle-blue text-white" : "bg-white hover:bg-cream-deep",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2 block">
              Mode
            </label>
            <div className="flex gap-2">
              {(["major", "minor"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-4 py-1.5 border-2 border-ink rounded-lg text-sm font-bold transition-colors",
                    mode === m ? "bg-noodle-yellow text-ink" : "bg-white hover:bg-cream-deep",
                  )}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <div className="text-ink-soft">Loading progressions…</div>}
        {error && <div className="text-red-600">{error}</div>}

        {data && !loading && (
          <div className="space-y-4">
            {/* Roman numeral legend */}
            <div className="border-2 border-ink rounded-xl p-4 bg-cream-deep">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                Diatonic Chords in {data.tonic} {data.mode}
              </div>
              <div className="flex flex-wrap gap-2">
                {data.progressions[0]?.chords.map((_, i) => {
                  // We can't get all diatonic chords from progressions; show as roman numerals
                  return null;
                })}
              </div>
            </div>

            {/* Progressions list */}
            {data.progressions.map((prog, progIdx) => {
              const popularMatch = POPULAR_PROGRESSION_NAMES.find((p) => p.name === prog.name);
              return (
                <div
                  key={progIdx}
                  className="border-2 border-ink rounded-xl p-4 bg-white"
                >
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div>
                      <div className="font-display text-xl uppercase">{prog.name}</div>
                      {popularMatch && (
                        <p className="text-sm text-ink-soft mt-1">
                          {popularMatch.description}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => playProgression(prog.chords)}
                      disabled={isPlaying}
                      className="noodle-btn"
                      size="sm"
                    >
                      {isPlaying && playingIdx >= 0 ? (
                        <Pause className="h-4 w-4 mr-1" />
                      ) : (
                        <Play className="h-4 w-4 mr-1" />
                      )}
                      Play Progression
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {prog.chords.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => playSingleChord(c)}
                        className={cn(
                          "border-2 border-ink rounded-lg p-3 text-center transition-all hover:-translate-y-0.5",
                          playingIdx === i && progIdx === 0
                            ? "bg-noodle-yellow scale-105"
                            : "bg-cream-deep hover:bg-noodle-pink",
                        )}
                      >
                        <div className="font-display text-lg">{c.name}</div>
                        <div className="text-[10px] text-ink-soft mt-1">
                          {c.notes.length} notes
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Educational note */}
        <div className="border-2 border-ink rounded-xl p-5 bg-noodle-yellow/10">
          <h4 className="font-display text-lg uppercase mb-2">How Roman Numerals Work</h4>
          <p className="text-sm text-ink-soft">
            Uppercase numerals (I, IV, V) are <strong>major</strong> chords.
            Lowercase numerals (ii, iii, vi) are <strong>minor</strong> chords.
            Lowercase with ° (vii°) is <strong>diminished</strong>.
            In a minor key, the patterns shift: i, iv, v are minor; III, VI, VII are major.
          </p>
        </div>
      </div>
    </ToolShell>
  );
}
