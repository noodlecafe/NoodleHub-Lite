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
} from "lucide-react";
import { useUI, type ToolId } from "@/lib/store";
import { cn } from "@/lib/utils";
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
  blue: { bg: "bg-noodle-blue", text: "text-white", hover: "hover:bg-noodle-blue-deep" },
  yellow: { bg: "bg-noodle-yellow", text: "text-ink", hover: "hover:bg-noodle-yellow-soft" },
  pink: { bg: "bg-noodle-pink", text: "text-ink", hover: "hover:bg-rose-300" },
};

const CATEGORIES = ["Theory", "Practice", "Reference"] as const;

export function Home() {
  const setTool = useUI((s) => s.setTool);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number] | "All">("All");
  const [locked, setLocked] = useState<LockedTool | null>(null);

  const openTool = (tool: ToolMeta) => {
    if (FREE_TOOLS.includes(tool.id)) {
      setTool(tool.id);
      return;
    }
    const content = LOCKED_CONTENT[tool.id];
    const colors = colorMap[tool.color];
    setLocked({
      title: tool.title,
      description: tool.description,
      icon: tool.icon,
      accent: cn(colors.bg, colors.text),
      features: content?.features ?? [],
      preview: content?.preview ?? null,
    });
  };

  const visibleTools = filter === "All" ? TOOLS : TOOLS.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAV */}
      <header className="border-b-2 border-ink bg-cream sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setTool("home")}
            className="flex items-center gap-2 group"
          >
            <img
	  src="/noodlehub-logo2.png"
	  alt="NoodleHub"
	  className="h-20 w-auto object-contain"
	/>
          </button>

          <nav className="hidden sm:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-3 py-1.5 text-sm font-bold uppercase tracking-wide rounded-full transition-colors",
                  filter === cat
                    ? "bg-ink text-cream"
                    : "text-ink-soft hover:bg-cream-deep",
                )}
              >
                {cat}
              </button>
            ))}
            <a
              href="https://discord.gg/HNuTZVrRWw"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 noodle-btn text-sm flex items-center gap-1"
            >
              <span>. ₊˚ ☎︎₊˚✧ Join Our Discord</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 noodle-btn noodle-btn-blue text-sm flex items-center gap-1"
            >
              Unlock All Tools
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-cream bg-grid">
        {/* Floating decorative shapes */}
        <div className="absolute top-12 right-[10%] w-24 h-24 bg-noodle-pink rounded-full opacity-80 animate-float-slow hidden sm:block" />
        <div className="absolute top-32 right-[8%] w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[42px] border-b-noodle-blue animate-float-medium hidden sm:block" />
        <div className="absolute bottom-20 left-[5%] w-16 h-16 border-4 border-noodle-blue rotate-12 animate-float-medium hidden lg:block" />
        <div className="absolute top-24 left-[40%] w-12 h-12 bg-noodle-yellow rounded-full opacity-90 animate-float-slow hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-white border-2 border-ink rounded-full noodle-shadow-sm">
                <span className="w-2 h-2 bg-noodle-blue rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  NoodleHub Lite · 3 Free Tools
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl uppercase leading-[0.95] mb-6">
                All the tools a{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">musician</span>
                  <span className="absolute inset-x-0 bottom-1 h-4 bg-noodle-yellow -z-0" />
                </span>{" "}
                needs.
              </h1>

              <p className="text-lg sm:text-xl text-ink-soft max-w-xl mb-8">
                NoodleHub is a private music toolkit built for our community,
                helping musicians explore chords, scales, rhythm, and music theory{" "}
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
            </div>

            {/* Hero illustration card */}
            <div className="relative">
              <motion.div
                initial={{ rotate: -3, y: 10 }}
                animate={{ rotate: -3, y: 0 }}
                className="relative bg-noodle-blue border-2 border-ink rounded-3xl p-8 noodle-shadow-lg"
              >
                <div className="text-white">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                      C Major Scale
                    </span>
                    <span className="px-2 py-0.5 bg-noodle-yellow text-ink text-xs font-bold rounded-full">
                      No Sharps
                    </span>
                  </div>
                  <div className="font-display text-4xl mb-6">
                    Do · Re · Mi · Fa · Sol · La · Ti · Do
                  </div>
                  {/* Mini piano preview */}
                  <div className="flex gap-1 h-16">
                    {["C", "D", "E", "F", "G", "A", "B"].map((n, i) => (
                      <div
                        key={n}
                        className="flex-1 bg-white rounded-b border border-ink flex items-end justify-center pb-1"
                      >
                        <span className="text-[10px] font-bold text-ink">{n}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="opacity-70 mb-1">Tonic</div>
                      <div className="font-bold">C</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="opacity-70 mb-1">Mode</div>
                      <div className="font-bold">Ionian</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="opacity-70 mb-1">Chords</div>
                      <div className="font-bold">7 diatonic</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-noodle-yellow border-2 border-ink rounded-2xl px-4 py-3 noodle-shadow"
              >
                <div className="text-xs font-bold uppercase tracking-wider">
                  Now Playing
                </div>
                <div className="font-display text-lg">C Maj 7</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-noodle-pink border-2 border-ink rounded-2xl px-4 py-3 noodle-shadow"
              >
                <div className="text-xs font-bold uppercase tracking-wider">
                  Tempo
                </div>
                <div className="font-display text-lg">120 BPM</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* TOOL GRID */}
      <section className="flex-1 bg-cream py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl uppercase mb-2">
                The Tool Kit
              </h2>
              <p className="text-ink-soft">
                Pick a tool. Locked tools are for members — tap one to preview it.
              </p>
            </div>
            <div className="flex sm:hidden gap-1 flex-wrap">
              {(["All", ...CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full transition-colors",
                    filter === cat
                      ? "bg-ink text-cream"
                      : "bg-cream-deep text-ink-soft",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

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
                    "group relative text-left border-2 border-ink rounded-2xl p-6 noodle-shadow hover:-translate-x-1 hover:-translate-y-1 transition-transform",
                    isLocked ? "bg-cream-deep" : "bg-white",
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl border-2 border-ink flex items-center justify-center",
                        colors.bg,
                        colors.text,
                        isLocked && "opacity-60",
                      )}
                    >
                      {tool.icon}
                    </div>
                    {isLocked ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-ink text-cream rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Lock className="h-3 w-3" />
                        Members
                      </span>
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-ink-soft group-hover:text-ink group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                  </div>
                  <h3 className="font-display text-2xl uppercase mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-ink-soft text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cream-deep text-ink-soft rounded-full">
                      {tool.category}
                    </span>
                    {!isLocked && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-noodle-yellow text-ink rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <LockedPreview tool={locked} onClose={() => setLocked(null)} />

      {/* FOOTER */}
      <footer className="bg-ink text-cream py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-display text-xl uppercase">NoodleHub</span>
              </div>
              <p className="text-cream/70 text-sm">
                Music Tools made by a passionate musician, 
		for passionate musicians.🤘
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-3">
                Powered By
              </h4>
              <ul className="space-y-1 text-sm text-cream/70">
                <li>PyTheory · music theory engine</li>
                <li>Tone.js · audio synthesis</li>
                <li>Tonal.js · instant client-side theory</li>
                <li>Next.js 16 + Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase text-sm tracking-wider mb-3">
                Inspired By
              </h4>
              <p className="text-sm text-cream/70">
                The noodlecafé sessions community, a place for people
                who want to learn music, make music, and have other
                people around while they do it.
              </p>
            </div>
          </div>
          <div className="border-t border-cream/20 pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-cream/50">
              © {new Date().getFullYear()} NoodleHub · Made by Noodlecafé 🍜
            </p>
            <p className="text-xs text-cream/50">
              All tools run in your browser. No data leaves your device.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
