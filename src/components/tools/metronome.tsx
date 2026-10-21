"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import * as Tone from "tone";
import { initAudio, clickTick } from "@/lib/audio";

const TIME_SIGNATURES = [
  { beats: 4, label: "4/4" },
  { beats: 3, label: "3/4" },
  { beats: 2, label: "2/4" },
  { beats: 6, label: "6/8" },
  { beats: 5, label: "5/4" },
  { beats: 7, label: "7/8" },
];

const TEMPO_MARKINGS = [
  { range: [20, 40], label: "Grave" },
  { range: [40, 60], label: "Largo" },
  { range: [60, 66], label: "Larghetto" },
  { range: [66, 76], label: "Adagio" },
  { range: [76, 108], label: "Andante" },
  { range: [108, 120], label: "Moderato" },
  { range: [120, 156], label: "Allegro" },
  { range: [156, 176], label: "Vivace" },
  { range: [176, 200], label: "Presto" },
  { range: [200, 400], label: "Prestissimo" },
];

export function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const stopRef = useRef<(() => void) | null>(null);

  // Update tempo without restarting
  useEffect(() => {
    if (playing) {
      Tone.getTransport().bpm.value = bpm;
    }
  }, [bpm, playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current();
      Tone.getTransport().stop();
      Tone.getTransport().cancel(0);
    };
  }, []);

  const handleToggle = useCallback(async () => {
    if (playing) {
      if (stopRef.current) stopRef.current();
      stopRef.current = null;
      setPlaying(false);
      setCurrentBeat(-1);
    } else {
      await initAudio();
      Tone.getTransport().bpm.value = bpm;
      let beatCount = 0;
      Tone.getTransport().cancel(0);
      Tone.getTransport().scheduleRepeat((time) => {
        const isDownbeat = beatCount % beatsPerMeasure === 0;
        clickTick(isDownbeat, time);
        Tone.getDraw().schedule(() => {
          setCurrentBeat(beatCount % beatsPerMeasure);
        }, time);
        beatCount++;
      }, "4n");
      Tone.getTransport().start();
      setPlaying(true);
    }
  }, [playing, bpm, beatsPerMeasure]);

  const tempoMarking = TEMPO_MARKINGS.find((m) => bpm >= m.range[0] && bpm < m.range[1])?.label;

  return (
    <ToolShell
      toolId="metronome"
      title="Metronome"
      description="A precise, audible metronome for practice. Set your tempo and time signature, and the downbeat will ring out louder so you always know where beat 1 is."
      icon={<Timer className="h-7 w-7 text-white" />}
      accent="blue"
    >
      <div className="space-y-8">
        {/* Beat indicator */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-16 h-16 rounded-full border-2 border-ink flex items-center justify-center font-display text-xl transition-all",
                currentBeat === i
                  ? i === 0
                    ? "bg-noodle-yellow scale-110 noodle-shadow"
                    : "bg-noodle-blue text-white scale-110 noodle-shadow"
                  : "bg-cream-deep text-ink-soft",
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* BPM display */}
        <div className="text-center">
          <div className="font-display text-5xl sm:text-6xl leading-none">
            {bpm}
          </div>
          <div className="text-sm text-ink-soft mt-1">
            Beats per minute {tempoMarking && `· ${tempoMarking}`}
          </div>
        </div>

        {/* Play button */}
        <div className="flex justify-center">
          <Button
            onClick={handleToggle}
            className={cn(
              "w-24 h-24 rounded-full border-2 border-ink font-display text-lg uppercase",
              playing
                ? "bg-noodle-pink text-ink"
                : "bg-noodle-yellow text-ink",
              "noodle-shadow-lg hover:translate-x-0 hover:translate-y-0",
            )}
          >
            {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
        </div>

        {/* BPM slider */}
        <div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
            <span>Tempo</span>
            <span>{bpm} BPM</span>
          </div>
          <Slider
            value={[bpm]}
            onValueChange={(v) => setBpm(v[0])}
            min={40}
            max={240}
            step={1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-ink-soft mt-1">
            <span>40</span>
            <span>120</span>
            <span>240</span>
          </div>
        </div>

        {/* Quick tempo buttons */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
            Quick Tempos
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[60, 80, 100, 120, 140, 160, 180, 200, 90, 70].map((t) => (
              <button
                key={t}
                onClick={() => setBpm(t)}
                className={cn(
                  "px-3 py-2 border-2 border-ink rounded-lg text-sm font-bold transition-colors",
                  bpm === t ? "bg-noodle-blue text-white" : "bg-white hover:bg-cream-deep",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Time signature */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
            Time Signature
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts.label}
                onClick={() => setBeatsPerMeasure(ts.beats)}
                className={cn(
                  "px-4 py-2 border-2 border-ink rounded-lg font-display text-lg uppercase transition-colors",
                  beatsPerMeasure === ts.beats
                    ? "bg-noodle-yellow"
                    : "bg-white hover:bg-cream-deep",
                )}
              >
                {ts.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
