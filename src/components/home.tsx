"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Guitar,
  Piano,
  Timer,
  Activity,
  Repeat,
  CircleDot,
  Tag,
  Key,
  Calculator,
  Volume2,
  Network,
  Sparkles,
  ArrowUpRight,
  Lock,
  LockOpen,
} from "lucide-react";
import { useUI, type ToolId } from "@/lib/store";
import { cn } from "@/lib/utils";
import { HeroLoop } from "@/components/hero-loop";
import { RecordCrate } from "@/components/easter-eggs";
import { LockedPreview, CHECKOUT_URL, type LockedTool } from "@/components/locked-preview";
import { LOCKED_CONTENT } from "@/components/locked-tools";

/** Tools available in NoodleHub Lite. Everything else is members-only. */
const FREE_TOOLS: ToolId[] = ["chord-progressions", "metronome", "guitar-chords"];

interface ToolMeta {
  id: ToolId;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "pink";
  category: "Theory" | "Practice" | "Reference";
}

const TOOLS: ToolMeta[] = [
  {
    id: "chord-finder",
    title: "Chord Finder",
    description: "Click notes on the piano and instantly identify the chord. Hear it, see it, learn it.",
    icon: <Piano className="h-6 w-6" />,
    color: "blue",
    category: "Theory",
  },
  {
    id: "scale-finder",
    title: "Scale Explorer",
    description: "Browse major, minor, modal and exotic scales. See notes on the piano and play them back.",
    icon: <Music className="h-6 w-6" />,
    color: "yellow",
    category: "Theory",
  },
  {
    id: "circle-of-fifths",
    title: "Circle of Fifths",
    description: "Interactive circle of fifths. Click any key to see its scale, chords, and signature.",
    icon: <CircleDot className="h-6 w-6" />,
    color: "pink",
    category: "Theory",
  },
  {
    id: "chord-progressions",
    title: "Chord Progressions",
    description: "Common progressions for any key. Play them back, swap in substitutions, find inspiration.",
    icon: <Repeat className="h-6 w-6" />,
    color: "blue",
    category: "Theory",
  },
  {
    id: "key-finder",
    title: "Key Finder",
    description: "Enter a set of notes and NoodleHub will identify the most likely key you're playing in.",
    icon: <Key className="h-6 w-6" />,
    color: "yellow",
    category: "Theory",
  },
  {
    id: "interval-trainer",
    title: "Interval Trainer",
    description: "Train your ear to recognize intervals. Two notes play, you name the distance.",
    icon: <Network className="h-6 w-6" />,
    color: "pink",
    category: "Practice",
  },
  {
    id: "metronome",
    title: "Metronome",
    description: "A precise, audible metronome with adjustable BPM and time signature. Visual beat indicator.",
    icon: <Timer className="h-6 w-6" />,
    color: "blue",
    category: "Practice",
  },
  {
    id: "bpm-tapper",
    title: "BPM Tapper",
    description: "Tap along to any song and find out its tempo in beats per minute.",
    icon: <Activity className="h-6 w-6" />,
    color: "yellow",
    category: "Practice",
  },
  {
    id: "note-frequency",
    title: "Note Frequency",
    description: "Find the exact frequency (Hz) of any note, or convert a frequency to its nearest note.",
    icon: <Calculator className="h-6 w-6" />,
    color: "pink",
    category: "Reference",
  },
  {
    id: "note-converter",
    title: "Note Name Converter",
    description: "Convert between scientific (C4), Helmholtz (c'), solfège (Do), and MIDI numbers.",
    icon: <Tag className="h-6 w-6" />,
    color: "blue",
    category: "Reference",
  },
  {
    id: "guitar-chords",
    title: "Guitar Chord Library",
    description: "Browse the most common guitar chords with diagrams and audio playback.",
    icon: <Guitar className="h-6 w-6" />,
    color: "yellow",
    category: "Reference",
  },
  {
    id: "fretboard",
    title: "Fretboard Visualizer",
    description: "See any scale or chord mapped across the entire guitar fretboard. Find every position.",
    icon: <Volume2 className="h-6 w-6" />,
    color: "pink",
    category: "Theory",
  },
];

const colorMap = {
  blue: { bg: "bg-noodle-blue", glow: "hover-glow-blue" },
  yellow: { bg: "bg-noodle-yellow", glow: "hover-glow-yellow" },
  pink: { bg: "bg-noodle-pink", glow: "hover-glow-pink" },
};

const CATEGORIES = ["Theory", "Practice", "Reference"] as const;

const TICKER = ["Chords", "Scales", "Rhythm", "Ear Training", "Fretboard", "Theory", "Tempo", "Keys"];

/** Little blinking pixel sparkles scattered behind the hero. */
function PixelSparkles() {
  const dots = [
    { c: "bg-noodle-yellow", p: "top-16 left-[8%]", d: "0s" },
    { c: "bg-noodle-pink", p: "top-40 right-[6%]", d: ".4s" },
    { c: "bg-noodle-lavender", p: "bottom-24 left-[46%]", d: ".9s" },
    { c: "bg-noodle-blue", p: "top-24 left-[52%]", d: "1.2s" },
    { c: "bg-noodle-yellow", p: "bottom-16 right-[30%]", d: ".6s" },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          className={cn("absolute w-2 h-2 animate-blink hidden sm:block", d.c, d.p)}
          style={{ animationDelay: d.d }}
        />
      ))}
    </>
  );
}

/** "You're using 3 of 12 tools" meter: lit blocks for free tools, locked blocks for the rest. */
function ToolMeter() {
  return (
    <a
      href={CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-8 block max-w-md noodle-card p-4 hover:border-noodle-yellow/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-display text-[9px] uppercase text-ink-soft">
          You&apos;re using <span className="text-noodle-yellow">3</span> of 12 tools
        </span>
        <span className="text-xs font-bold text-noodle-yellow group-hover:underline flex items-center gap-1">
          Unlock the other 9 <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="grid grid-cols-12 gap-1.5">
        {TOOLS.map((t, i) =>
          i < FREE_TOOLS.length ? (
            <span key={t.id} className="h-3 rounded-sm bg-noodle-yellow glow-yellow" />
          ) : (
            <span key={t.id} className="h-3 rounded-sm bg-cream-deep border border-ink" />
          ),
        )}
      </div>
    </a>
  );
}

/** Members pitch shown above the tool grid, dressed up as a record crate. */
function UpgradeBanner() {
  const perks = [
    "Name any chord you play. Just click the keys",
    "Train your ear to recognize intervals by sound",
    "See every scale and chord across the whole fretboard",
    "Find the key from the notes you play",
  ];
  return (
    <div className="relative overflow-hidden noodle-card p-6 sm:p-8 mb-8 border-noodle-yellow/30">
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-noodle-pink/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-20 w-56 h-56 rounded-full bg-noodle-yellow/10 blur-3xl pointer-events-none" />
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center relative">
        <div>
          <div className="font-display text-[10px] uppercase text-noodle-pink mb-3">Side B · 9 more tracks</div>
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
            Everything in its <span className="text-noodle-yellow">right place.</span>
          </h3>
          <p className="text-ink-soft mb-5">
            You&apos;re playing 3 of 12 tracks. Members get the whole album.
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-ink-soft mb-6">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 bg-noodle-yellow shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="noodle-btn text-base flex items-center gap-2 whitespace-nowrap"
            >
              <LockOpen className="h-5 w-5" />
              Unlock all 12 tools
            </a>
            <span className="text-xs text-ink-soft">Secure checkout with Whop</span>
          </div>
        </div>
        <RecordCrate />
      </div>
    </div>
  );
}

export function Home() {
  const setTool = useUI((s) => s.setTool);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number] | "All">("All");
  const [locked, setLocked] = useState<LockedTool | null>(null);

  const openTool = (tool: ToolMeta) => {
    if (FREE_TOOLS.includes(tool.id)) {
      setTool(tool.id);
      return;
    }
    setLocked({
      title: tool.title,
      description: tool.description,
      icon: tool.icon,
      accent: colorMap[tool.color].bg,
      features: LOCKED_CONTENT[tool.id]?.features ?? [],
      video: `/previews/${tool.id}.mp4`,
      poster: `/previews/${tool.id}.jpg`,
    });
  };

  const visibleTools = filter === "All" ? TOOLS : TOOLS.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAV */}
      <header className="border-b border-ink bg-cream/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setTool("home")} className="flex items-center gap-2 group">
            <img src="/noodlehub-logo2.png" alt="NoodleHub" className="h-16 sm:h-20 w-auto object-contain" />
          </button>

          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden noodle-btn text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <LockOpen className="h-3.5 w-3.5" />
            Unlock all
          </a>

          <nav className="hidden sm:flex items-center gap-1">
            {(["All", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "font-display px-3 py-2 text-[10px] uppercase rounded-full transition-colors",
                  filter === cat ? "bg-noodle-yellow" : "text-ink-soft hover:text-ink",
                )}
              >
                {cat}
              </button>
            ))}
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 noodle-btn text-sm flex items-center gap-1.5"
            >
              <LockOpen className="h-4 w-4" />
              Unlock all 12 tools
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-grid">
        <PixelSparkles />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="font-display text-[10px] sm:text-xs uppercase text-noodle-yellow text-glow mb-6">
                NoodleHub Lite · 3 Free Tools
              </div>

              <h1 className="font-display text-2xl sm:text-4xl uppercase leading-[1.3] mb-6">
                All the tools a <span className="text-noodle-pink">musician</span> needs.
              </h1>
              <div className="dash-line w-40 mb-6 opacity-80" />

              <p className="text-lg sm:text-xl text-ink-soft max-w-xl mb-8">
                NoodleHub is a private music toolkit built for our community, helping musicians
                explore chords, scales, rhythm, and music theory{" "}
                <span className="font-bold text-ink">in one place</span>.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTool("chord-progressions")}
                  className="noodle-btn text-base flex items-center gap-2"
                >
                  <Repeat className="h-5 w-5" />
                  Start with Chord Progressions
                </button>
                <button
                  onClick={() => setTool("metronome")}
                  className="noodle-btn noodle-btn-blue text-base flex items-center gap-2"
                >
                  <Timer className="h-5 w-5" />
                  Open Metronome
                </button>
              </div>

              <ToolMeter />
            </div>

            <HeroLoop />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="border-y border-ink overflow-hidden py-4 bg-coal/60">
        <div className="flex w-max animate-marquee">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="font-display text-xs uppercase px-6 flex items-center gap-6">
              <span className={i % 3 === 0 ? "text-noodle-yellow" : i % 3 === 1 ? "text-noodle-pink" : "text-noodle-lavender"}>
                {t}
              </span>
              <span className="w-1.5 h-1.5 bg-ink-soft/50" />
            </span>
          ))}
        </div>
      </div>

      {/* TOOL GRID */}
      <section className="flex-1 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="font-display text-lg sm:text-2xl uppercase text-noodle-yellow text-glow mb-3">
                The Tool Kit
              </h2>
              <p className="text-ink-soft">
                Pick a tool. Locked tools are for members. Tap one to preview it.
              </p>
            </div>
            <div className="flex sm:hidden gap-1 flex-wrap">
              {(["All", ...CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "font-display px-3 py-2 text-[9px] uppercase rounded-full transition-colors",
                    filter === cat ? "bg-noodle-yellow" : "bg-cream-deep text-ink-soft",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <UpgradeBanner />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleTools.map((tool, i) => {
              const colors = colorMap[tool.color];
              const isLocked = !FREE_TOOLS.includes(tool.id);
              return (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  onClick={() => openTool(tool)}
                  className={cn(
                    "group relative text-left noodle-card p-6 hover:-translate-y-1 hover:border-white/20 transition-all",
                    isLocked && "opacity-40 hover:opacity-75",
                  )}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-shadow",
                        colors.bg,
                        colors.glow,
                        isLocked && "grayscale",
                      )}
                    >
                      {tool.icon}
                    </div>
                    {isLocked ? (
                      <span className="pixel-chip flex items-center gap-1.5 bg-coal text-ink-soft border border-ink">
                        <Lock className="h-3 w-3" />
                        Members
                      </span>
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-ink-soft group-hover:text-noodle-yellow group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    )}
                  </div>
                  <h3 className="font-display text-xs uppercase mb-3 leading-relaxed">{tool.title}</h3>
                  <p className="text-ink-soft text-sm leading-relaxed">{tool.description}</p>
                  <div className="mt-5 flex gap-2">
                    <span className="pixel-chip bg-cream-deep text-ink-soft">{tool.category}</span>
                    {!isLocked && <span className="pixel-chip bg-noodle-yellow">Free</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <LockedPreview tool={locked} onClose={() => setLocked(null)} />

      {/* FOOTER */}
      <footer className="border-t border-ink bg-coal/70 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="font-display text-sm uppercase text-noodle-yellow mb-4">NoodleHub</div>
              <p className="text-ink-soft text-sm">
                Music tools made by a passionate musician, for passionate musicians. 🤘
              </p>
            </div>
            <div>
              <h4 className="font-display text-[10px] uppercase text-noodle-pink mb-4">Powered By</h4>
              <ul className="space-y-1 text-sm text-ink-soft">
                <li>PyTheory · music theory engine</li>
                <li>Tone.js · audio playback</li>
                <li>Tonal.js · instant client-side theory</li>
                <li>Next.js 16 + Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-[10px] uppercase text-noodle-lavender mb-4">Inspired By</h4>
              <p className="text-sm text-ink-soft">
                The noodlecafé sessions community, a place for people who want to learn music, make
                music, and have other people around while they do it.
              </p>
            </div>
          </div>
          <div className="border-t border-ink pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-ink-soft/70">© {new Date().getFullYear()} NoodleHub · Made by Noodlecafé 🍜</p>
            <p className="text-xs text-ink-soft/70">
              Piano: Salamander Grand Piano by Alexander Holm · Guitar: tonejs-instruments by Nicholaus
              Brosowsky · both CC-BY 3.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
