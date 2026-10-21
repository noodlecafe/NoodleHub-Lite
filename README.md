# 🍜 NoodleHub

> **NoodleHub Lite** — the free edition. Chord Progressions, Metronome, and the Guitar Chord Library are free to use; every other tool is shown as a locked preview. [Join to unlock all 12 tools →](https://whop.com/checkout/plan_hrnkCXO1bMwRs)

**Free, open-source musician tools — built with Next.js, Tone.js, and PyTheory.**

NoodleHub is a browser-based toolkit for songwriters, producers, learners, and anyone who makes music. Twelve carefully crafted tools cover the everyday needs of a musician — chord identification, scale exploration, ear training, metronome, fretboard visualization, and more. Everything runs in the browser; nothing leaves your device.

Inspired by the playful, friendly aesthetic of [noodlecafé sessions](https://noodlecafe.co) — a community for people who want to learn music, make music, and have other people around while they do it.

---

## ✨ Features

### Twelve Tools, All in Your Browser

| # | Tool | What it does |
|---|------|--------------|
| 1 | **Chord Finder** | Click notes on the piano and instantly identify the chord. |
| 2 | **Scale Explorer** | Browse major, minor, modal, harmonic-minor scales. Hear them ascending. |
| 3 | **Circle of Fifths** | Interactive SVG circle. Click any key for its scale, chords, signature. |
| 4 | **Chord Progressions** | Common progressions per key (I-V-vi-IV, I-IV-V-I, etc.) with playback. |
| 5 | **Key Finder** | Enter notes from your melody; NoodleHub tells you the most likely key. |
| 6 | **Interval Trainer** | Ear training. Two notes play, you name the interval. Three difficulty levels. |
| 7 | **Metronome** | Precise BPM (40-240), 6 time signatures, audible downbeat, visual beat indicator. |
| 8 | **BPM Tapper** | Tap along to a song to find its tempo. Auto-resets after 3s. |
| 9 | **Note Frequency Calculator** | Convert note ↔ Hz both directions. Includes cents-off deviation. |
| 10 | **Note Name Converter** | Scientific (C4) ↔ Helmholtz (c') ↔ solfège (Do) ↔ MIDI (60). |
| 11 | **Guitar Chord Library** | Common chord shapes with SVG diagrams and audio playback. |
| 12 | **Fretboard Visualizer** | Map any of 13 scales or 11 chord types across the guitar fretboard. |

### Design

- **Noodlecafé-inspired palette** — warm cream background, royal blue primary, pastel pink and lemon yellow accents, hard black borders and shadows for that hand-drawn feel.
- **Anton display font** for bold uppercase headlines.
- **Fully responsive** — works on phone, tablet, and desktop.
- **No third-party tracking, no ads, no logins.**

### Powered By Real Music Theory

The backend computations run through [**PyTheory**](https://github.com/KieranP/PyTheory), a Python library for music theory. A small Python CLI (`scripts/pytheory_cli.py`) is invoked by the Next.js API route (`src/app/api/pytheory/route.ts`), which spawns the Python process per request and caches results in-memory for 5 minutes.

For instant browser-side audio (chord playback, metronome clicks, etc.), NoodleHub uses [**Tone.js**](https://tonejs.github.io/).

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (tested on 20 and 22)
- **Python 3.10+** with `pip`
- **bun** (optional but recommended — `npm i -g bun`)

### Install

```bash
git clone https://github.com/your-username/noodlehub.git
cd noodlehub

# Install JS dependencies
bun install   # or: npm install

# Install PyTheory (Python music theory library)
pip install pytheory fastapi uvicorn
```

### Run in Development

```bash
bun run dev   # or: npm run dev
```

Then open `http://localhost:3000`.

### Run in Production

```bash
bun run build
bun run start
```

---

## 🏗️ Project Structure

```
noodlehub/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Anton + Inter fonts
│   │   ├── page.tsx                # Single-page app: routes between tools
│   │   ├── globals.css             # Noodlecafé-themed tokens + utilities
│   │   └── api/
│   │       └── pytheory/route.ts   # Next.js API route → Python subprocess
│   ├── components/
│   │   ├── home.tsx                # Hero + tool grid + footer
│   │   ├── piano-keyboard.tsx      # Reusable interactive piano
│   │   ├── tool-shell.tsx          # Wrapper for each tool page
│   │   ├── ui/                     # shadcn/ui component primitives
│   │   └── tools/
│   │       ├── chord-finder.tsx
│   │       ├── scale-finder.tsx
│   │       ├── circle-of-fifths.tsx
│   │       ├── metronome.tsx
│   │       ├── bpm-tapper.tsx
│   │       ├── note-frequency.tsx
│   │       ├── note-converter.tsx
│   │       ├── chord-progressions.tsx
│   │       ├── interval-trainer.tsx
│   │       ├── guitar-chords.tsx
│   │       ├── fretboard.tsx
│   │       └── key-finder.tsx
│   └── lib/
│       ├── pytheory.ts             # Typed client for the PyTheory API
│       ├── audio.ts                # Tone.js wrapper (chord/note/metronome)
│       └── store.ts                # Zustand store for active tool
├── scripts/
│   └── pytheory_cli.py             # Python CLI invoked by the API route
├── mini-services/
│   └── pytheory-service/           # Optional standalone FastAPI service
│       ├── main.py                 # FastAPI version of the PyTheory API
│       └── run.sh                  # Auto-restart wrapper
├── public/
├── prisma/
└── package.json
```

---

## 🎼 How the PyTheory integration works

NoodleHub uses two complementary ways to talk to PyTheory:

1. **Primary (always works): `src/app/api/pytheory/route.ts`**
   - A Next.js API route that spawns `python3 scripts/pytheory_cli.py <fn> <args_json>` per request.
   - Results are cached in-memory for 5 minutes.
   - Works on any deploy that has Python + PyTheory installed.
   - Adds ~200-400ms latency per unique request.

2. **Optional standalone service: `mini-services/pytheory-service/`**
   - A FastAPI service that runs PyTheory as a long-lived process.
   - Faster response (no Python startup cost per request).
   - Start it with: `cd mini-services/pytheory-service && python3 main.py`
   - Listens on port 3031.
   - The Next.js app can be configured to proxy to it via `XTransformPort=3031`.

To switch from the subprocess approach to the standalone service, replace the `callPyTheory` function in `src/app/api/pytheory/route.ts` with `fetch` calls to `http://localhost:3031/...`.

### Available PyTheory functions

| Function | Args | Returns |
|----------|------|---------|
| `health` | `{}` | `{ status, pytheory_version }` |
| `available_scales` | `{}` | `{ scales: string[] }` |
| `get_scale` | `{ tonic, mode }` | Scale notes, chords, key signature |
| `all_keys` | `{}` | All 24 major/minor keys |
| `detect_key` | `{ notes: string[] }` | Most likely key from a set of notes |
| `circle_of_fifths` | `{}` | Major + minor circle of fifths data |
| `common_progressions` | `{ tonic, mode }` | Common chord progressions |
| `build_progression` | `{ tonic, mode, numerals }` | Chord progression from roman numerals |
| `identify_chord` | `{ notes: string[] }` | Identify a chord from its notes |
| `note_info` | `{ note }` | Full info about a note |
| `note_convert` | `{ note }` | Convert note between naming systems |
| `note_from_midi` | `{ midi }` | Note from MIDI number |
| `note_from_frequency` | `{ freq }` | Nearest note to a frequency |

---

## 🎨 Customization

### Change the color palette

All colors are defined as CSS variables in `src/app/globals.css` under `:root`:

```css
:root {
  --background: #F9F7F2;     /* warm cream */
  --primary: #1A4BEB;        /* noodle blue */
  --accent: #FFD600;         /* noodle yellow */
  --noodle-pink: #F4A6B8;
  /* ... etc */
}
```

### Add a new tool

1. Create a new file in `src/components/tools/your-tool.tsx`:
   ```tsx
   "use client";
   import { ToolShell } from "@/components/tool-shell";

   export function YourTool() {
     return (
       <ToolShell
         toolId="your-tool"
         title="Your Tool"
         description="What it does"
         icon={<Icon className="h-7 w-7" />}
         accent="blue"
       >
         {/* tool content */}
       </ToolShell>
     );
   }
   ```
2. Add the tool to the `ToolId` type and `TOOLS` array in `src/components/home.tsx`.
3. Add a `case` in `src/app/page.tsx`.

### Add a new PyTheory function

1. Add a handler in `scripts/pytheory_cli.py` (and optionally in `mini-services/pytheory-service/main.py`).
2. Add the method signature to `PyTheoryService` and an implementation in `src/lib/pytheory.ts`.

---

## 🤝 Contributing

Pull requests welcome! Some ideas for new tools:

- **Tuner** — use the Web Audio API to detect pitch from the microphone.
- **Song key analyzer** — paste a chord progression, get the key + suggested substitutions.
- **Drum pattern sequencer** — step sequencer with Tone.js drum samples.
- **Lyrics & chords formatter** — paste a song, auto-format with chord names above lyrics.
- **Ear training: melody** — play a short melody, user repeats it on the piano.
- **Reverse chord finder** — pick a chord name, get all voicings on guitar/piano.

### Style guide

- Use **noodle-card** + **noodle-shadow** utility classes for cards.
- Use the **noodle-btn** / **noodle-btn-blue** / **noodle-btn-pink** classes for buttons.
- Headlines use `font-display` (Anton) and are UPPERCASE.
- Body text uses the default Inter.
- Always include a `ToolShell` wrapper for new tools.

---

## 📜 License

MIT — see `LICENSE`.

## 🙏 Acknowledgements

- **[PyTheory](https://github.com/KieranP/PyTheory)** — music theory engine
- **[Tone.js](https://tonejs.github.io/)** — Web Audio framework
- **[Tonal.js](https://github.com/tonaljs/tonal)** — client-side music theory (available as a fallback)
- **[Next.js](https://nextjs.org)** + **[Tailwind CSS](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)**
- **[noodlecafé sessions](https://noodlecafe.co)** — for the design inspiration and the community spirit

---

Made with 🍜 for musicians everywhere.
