---
Task ID: noodlehub-build
Agent: main
Task: Build NoodleHub — a complete musician tools web app inspired by muted.io, using PyTheory, matching the noodlecafé sessions visual style.

Work Log:
- Analyzed the user's uploaded image of "noodlecafé sessions" via vision model to extract the design language: cream background (#F9F7F2), royal blue primary (#1A4BEB), pastel pink (#F4A6B8), lemon yellow (#FFD600), Anton display font + Inter body, hard black borders + offset shadows.
- Installed PyTheory (Python music theory library) and verified its API: Key, Note, Chord, TonedScale, Key.detect, Key.common_progressions, Note.frequency, Note.solfege, etc.
- Built a FastAPI PyTheory service in mini-services/pytheory-service/main.py (port 3031) — works but the sandbox kills long-running background processes after ~30-60s.
- Pivoted to a more reliable architecture: a Next.js API route (src/app/api/pytheory/route.ts) that spawns `python3 scripts/pytheory_cli.py <fn> <args>` per request, with in-memory 5-minute caching. This avoids the long-running-service problem entirely.
- Created the noodlecafé-themed design system in src/app/globals.css (CSS variables, noodle-card, noodle-btn, noodle-shadow utilities, piano-key styles, floating-shape animations).
- Loaded Anton + Inter fonts via next/font in src/app/layout.tsx.
- Built reusable UI primitives: PianoKeyboard (interactive SVG/CSS piano), ToolShell (wrapper for each tool), and the home page with hero + tool grid + footer.
- Implemented 12 fully-working tools:
  1. Chord Finder — click notes on piano, PyTheory identifies the chord (C, E, G → "C major")
  2. Scale Explorer — pick tonic + mode (8 modes), see notes/solfege/frequencies, hear scale ascending
  3. Circle of Fifths — interactive SVG, click any major or minor key for scale/chords/signature
  4. Chord Progressions — common progressions per key with playback (Tone.js chord strumming)
  5. Key Finder — pick notes, PyTheory detects the most likely key
  6. Interval Trainer — ear training with 3 difficulty levels, melodic + harmonic playback, stats
  7. Metronome — adjustable 40-240 BPM, 6 time signatures, visual beat indicator, Tone.js audio
  8. BPM Tapper — tap to detect tempo, keyboard (space) support, auto-reset after 3s
  9. Note Frequency Calculator — note↔Hz bidirectional, cents-off deviation, reference table
  10. Note Name Converter — scientific/Helmholtz/solfege/MIDI/pitch-class all at once
  11. Guitar Chord Library — SVG chord diagrams with finger positions, 28 chord shapes, audio
  12. Fretboard Visualizer — full guitar fretboard (15 frets), 13 scales + 11 chord types, click to play
- Wired all theory-heavy tools to PyTheory via the API route (scales, chords, progressions, key detection, note info, frequency).
- Audio playback everywhere via Tone.js (polyphonic synth for chords, square-wave click for metronome).
- Wrote README.md (250 lines) with full project structure, install instructions, PyTheory integration docs, contribution guide, and ideas for future tools.
- Added LICENSE (MIT) and updated .gitignore for Python/Next.js/sandbox artifacts.
- Verified all 12 tools via agent-browser: homepage loads, every tool opens, Chord Finder correctly identifies "C major", Key Finder correctly identifies "A minor" from A/C/E, no console errors.
- ESLint passes clean (0 errors, 0 warnings).
- Final TypeScript codebase: 12 tools + 4 shared components + 3 lib files = ~10,124 lines of TS/TSX.

Stage Summary:
- Deliverable: A fully-working, GitHub-ready musician tools web app called "NoodleHub"
- 12 interactive tools, all with audio playback
- PyTheory integration via Next.js API route (subprocess + caching)
- noodlecafé-inspired design (cream/blue/pink/yellow, Anton display font, hard-shadow cards)
- README.md, LICENSE, .gitignore all in place
- Lint clean, no console errors, all tools verified via agent-browser
