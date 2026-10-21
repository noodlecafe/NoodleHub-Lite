"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** The four-chord loop shown in the hero: G → Em → C → D. -1 = muted, 0 = open. */
const LOOP = [
  { name: "G", frets: [3, 2, 0, 0, 0, 3], color: "#8FA6FF", text: "text-noodle-blue" },
  { name: "Em", frets: [0, 2, 2, 0, 0, 0], color: "#F7E35E", text: "text-noodle-yellow" },
  { name: "C", frets: [-1, 3, 2, 0, 1, 0], color: "#CDC6F5", text: "text-noodle-lavender" },
  { name: "D", frets: [-1, -1, 0, 2, 3, 2], color: "#F0347E", text: "text-noodle-pink" },
];

function MiniChord({ frets, color, lit }: { frets: number[]; color: string; lit: boolean }) {
  const w = 76, h = 74, px = 8, top = 14, ss = (w - px * 2) / 5, fs = 14;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 sm:w-24">
      <defs>
        <filter id={`g-${color.slice(1)}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line x1={px - 1} y1={top} x2={w - px + 1} y2={top} stroke="#F4EEE6" strokeWidth="3" />
      {[1, 2, 3, 4].map((i) => (
        <line key={i} x1={px} y1={top + i * fs} x2={w - px} y2={top + i * fs} stroke="#F4EEE6" strokeOpacity="0.6" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={px + i * ss} y1={top} x2={px + i * ss} y2={top + 4 * fs} stroke="#F4EEE6" strokeOpacity="0.6" />
      ))}
      {frets.map((f, i) => {
        const x = px + i * ss;
        if (f === -1)
          return (
            <text key={i} x={x} y={top - 4} textAnchor="middle" fontSize="8" fill="#F4EEE6">
              ×
            </text>
          );
        if (f === 0) return <circle key={i} cx={x} cy={top - 6} r="2.6" fill="none" stroke="#F4EEE6" strokeWidth="1.2" />;
        return (
          <circle
            key={i}
            cx={x}
            cy={top + (f - 0.5) * fs}
            r="4.6"
            fill={lit ? color : "#F4EEE6"}
            filter={`url(#g-${color.slice(1)})`}
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}

function Arrow({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("absolute w-9 h-9 text-ink-soft", className)} fill="none">
      <path d="M6 30 Q 10 12 30 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 4 L31 8 L25 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroLoop() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % LOOP.length), 1100);
    return () => clearInterval(id);
  }, []);

  // top, right, bottom, left
  const pos = [
    "left-1/2 -translate-x-1/2 top-0",
    "right-0 top-1/2 -translate-y-1/2",
    "left-1/2 -translate-x-1/2 bottom-0",
    "left-0 top-1/2 -translate-y-1/2",
  ];

  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-square">
      {LOOP.map((c, i) => (
        <div key={c.name} className={cn("absolute flex flex-col items-center gap-1", pos[i])}>
          <span
            className={cn(
              "font-extrabold text-2xl sm:text-3xl transition-all duration-300",
              c.text,
              active === i ? "scale-110 [text-shadow:0_0_16px_currentColor]" : "opacity-70",
            )}
          >
            {c.name}
          </span>
          <MiniChord frets={c.frets} color={c.color} lit={active === i} />
        </div>
      ))}
      <Arrow className="right-[17%] top-[17%] rotate-[100deg]" />
      <Arrow className="right-[17%] bottom-[17%] rotate-[190deg]" />
      <Arrow className="left-[17%] bottom-[17%] rotate-[280deg]" />
      <Arrow className="left-[17%] top-[17%] rotate-[10deg]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="font-display text-sm sm:text-base text-ink">ONE LOOP</span>
        <span className="font-display text-[9px] sm:text-[10px] text-ink-soft mt-3 !leading-[2.2]">
          4 CHORDS
          <br />
          ENDLESS SONGS
        </span>
      </div>
    </div>
  );
}
