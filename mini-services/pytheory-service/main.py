"""
NoodleHub PyTheory Service
A FastAPI service exposing the PyTheory music theory library
for the NoodleHub web app.

Run with: python3 main.py  (port 3031)
"""
import re
import json
from typing import List, Optional, Union
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pytheory
from pytheory import Key, Note, Chord, TonedScale, Tone

app = FastAPI(
    title="NoodleHub PyTheory Service",
    description="Music theory engine for NoodleHub, powered by PyTheory",
    version="1.0.0",
)

# Allow the Next.js app to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_MODES = [
    "major", "minor", "ionian", "dorian", "phrygian",
    "lydian", "mixolydian", "aeolian", "locrian",
    "harmonic minor",
]

ALL_TONICS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F",
              "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"]


# ---------- helpers ----------

def _safe_call(fn, default=None):
    try:
        return fn()
    except Exception as e:
        return default


def _note_to_dict(n: Note) -> dict:
    return {
        "name": str(n),
        "scientific": n.scientific,
        "helmholtz": n.helmholtz,
        "midi": n.midi,
        "frequency": round(n.frequency, 4),
        "solfege": n.solfege,
        "letter": n.letter,
        "is_sharp": n.is_sharp,
        "is_flat": n.is_flat,
        "is_natural": n.is_natural,
        "pitch_class": n.midi % 12,
    }


def _chord_to_dict(c: Chord) -> dict:
    name = _safe_call(lambda: c.identify(), default=str(c))
    tones = _safe_call(lambda: c.tones, default=[])
    notes = []
    if tones:
        for t in tones:
            notes.append({
                "name": str(t),
                "scientific": _safe_call(lambda: t.scientific, default=str(t)),
                "midi": _safe_call(lambda: t.midi, default=None),
                "frequency": _safe_call(lambda: round(t.frequency, 4), default=None),
            })
    return {"name": name, "notes": notes}


def _key_to_dict(k: Key) -> dict:
    sig = _safe_call(lambda: k.signature(), default={})
    if not isinstance(sig, dict):
        sig = {}
    chords = _safe_call(lambda: k.chords, default=[])
    seventh = _safe_call(lambda: k.seventh_chords, default=[])
    scale = _safe_call(lambda: k.scale, default=None)
    note_names = _safe_call(lambda: k.note_names, default=[])
    return {
        "tonic": str(k.tonic_name) if hasattr(k, "tonic_name") else "C",
        "mode": k.mode if hasattr(k, "mode") else "major",
        "note_names": list(note_names) if note_names else [],
        "chords": list(chords) if chords else [],
        "seventh_chords": list(seventh) if seventh else [],
        "signature": {
            "sharps": sig.get("sharps", 0) if sig else 0,
            "flats": sig.get("flats", 0) if sig else 0,
        },
    }


# ---------- routes ----------

@app.get("/")
def root():
    return {
        "service": "NoodleHub PyTheory Service",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/scales/available",
            "/scales/{tonic}/{mode}",
            "/keys/all",
            "/keys/detect",
            "/circle-of-fifths",
            "/progressions/{tonic}/{mode}",
            "/progression/{tonic}/{mode}",
            "/chord/identify",
            "/note/frequency",
            "/note/info",
            "/note/convert",
            "/note/from-midi",
            "/note/from-frequency",
        ],
    }


@app.get("/health")
def health():
    return {"status": "ok", "pytheory_version": pytheory.__version__}


@app.get("/scales/available")
def available_scales():
    """List all scale types supported by PyTheory."""
    try:
        ts = TonedScale(tonic="C")
        scales = list(ts.scales)
    except Exception:
        scales = VALID_MODES
    return {"scales": scales}


@app.get("/scales/{tonic}/{mode}")
def get_scale(tonic: str, mode: str):
    """Return the notes, chords, and 7th chords of a scale."""
    try:
        k = Key(tonic, mode)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid key: {e}")

    sig = _safe_call(lambda: k.signature(), default={})
    if not isinstance(sig, dict):
        sig = {}
    chords = _safe_call(lambda: k.chords, default=[])
    seventh = _safe_call(lambda: k.seventh_chords, default=[])
    note_names = _safe_call(lambda: k.note_names, default=[])

    # Also compute Note objects with frequencies
    scale_notes = []
    if note_names:
        for nm in note_names:
            try:
                n = Note(nm + "4")
                scale_notes.append(_note_to_dict(n))
            except Exception:
                pass

    return {
        "tonic": tonic,
        "mode": mode,
        "note_names": list(note_names) if note_names else [],
        "notes": scale_notes,
        "chords": list(chords) if chords else [],
        "seventh_chords": list(seventh) if seventh else [],
        "signature": {
            "sharps": sig.get("sharps", 0) if sig else 0,
            "flats": sig.get("flats", 0) if sig else 0,
        },
    }


@app.get("/keys/all")
def all_keys():
    """Return every supported key (major and minor)."""
    out = []
    try:
        for k in Key.all_keys():
            out.append(_key_to_dict(k))
    except Exception:
        # Fallback: build manually
        for tonic in ALL_TONICS:
            for mode in ["major", "minor"]:
                try:
                    k = Key(tonic, mode)
                    out.append(_key_to_dict(k))
                except Exception:
                    pass
    return {"keys": out}


@app.get("/keys/detect")
def detect_key(notes: str = Query(..., description="Comma-separated note names, e.g. C,E,G")):
    """Detect the most likely key from a set of notes."""
    note_list = [n.strip() for n in notes.split(",") if n.strip()]
    if not note_list:
        raise HTTPException(status_code=400, detail="No notes provided")
    try:
        k = Key.detect(*note_list)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if k is None:
        return {"key": None, "tonic": None, "mode": None}
    return {"key": str(k), **_key_to_dict(k)}


@app.get("/circle-of-fifths")
def circle_of_fifths():
    """Return the full circle of fifths for major and minor keys."""
    major = []
    minor = []
    # Standard circle of fifths ordering
    order = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F",
             "Bb", "Eb", "Ab", "Db", "Gb", "Cb"]
    # Deduplicate while preserving order
    seen = set()
    ordered_tonics = []
    for t in order:
        if t not in seen:
            seen.add(t)
            ordered_tonics.append(t)

    # Major keys: sharps for first 7, flats for next 7
    circle_major = []
    circle_minor = []
    # Standard: C, G, D, A, E, B, F# (sharps 0-6), then C, F, Bb, Eb, Ab, Db, Gb (flats)
    fifths_major = [("C", 0), ("G", 1), ("D", 2), ("A", 3), ("E", 4), ("B", 5), ("F#", 6),
                    ("C", 0), ("F", 1), ("Bb", 2), ("Eb", 3), ("Ab", 4), ("Db", 5), ("Gb", 6)]
    fifths_minor = [("A", 0), ("E", 1), ("B", 2), ("F#", 3), ("C#", 4), ("G#", 5), ("D#", 6),
                    ("A", 0), ("D", 1), ("G", 2), ("C", 3), ("F", 4), ("Bb", 5), ("Eb", 6)]

    return {
        "major": fifths_major,
        "minor": fifths_minor,
        "explanation": (
            "Circle of fifths arranged clockwise: each step up a perfect fifth. "
            "Sharps accumulate clockwise from C; flats accumulate counter-clockwise from C. "
            "Relative minor is a minor third below its major key (e.g., A minor is the relative minor of C major)."
        ),
    }


@app.get("/progressions/{tonic}/{mode}")
def common_progressions(tonic: str, mode: str):
    """Return common chord progressions for a key."""
    try:
        k = Key(tonic, mode)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid key: {e}")
    cps = _safe_call(lambda: k.common_progressions(), default={})
    out = []
    if isinstance(cps, dict):
        for prog_name, chords in cps.items():
            chord_dicts = []
            for c in chords:
                chord_dicts.append(_chord_to_dict(c))
            out.append({"name": prog_name, "chords": chord_dicts})
    return {"tonic": tonic, "mode": mode, "progressions": out}


@app.get("/progression/{tonic}/{mode}")
def build_progression(
    tonic: str,
    mode: str,
    numerals: str = Query(..., description="Comma-separated roman numerals, e.g. I,V,vi,IV"),
):
    """Build a specific chord progression from roman numerals."""
    try:
        k = Key(tonic, mode)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid key: {e}")
    num_list = [n.strip() for n in numerals.split(",") if n.strip()]
    try:
        prog = k.progression(*num_list)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    chord_dicts = []
    for c in prog:
        chord_dicts.append(_chord_to_dict(c))
    return {"tonic": tonic, "mode": mode, "numerals": num_list, "chords": chord_dicts}


@app.get("/chord/identify")
def identify_chord(notes: str = Query(..., description="Comma-separated note names, e.g. C,E,G")):
    """Identify a chord from a list of notes."""
    note_list = [n.strip() for n in notes.split(",") if n.strip()]
    if not note_list:
        raise HTTPException(status_code=400, detail="No notes provided")
    try:
        # Build Tone objects with octave
        tones = []
        for i, nm in enumerate(note_list):
            tones.append(Tone(nm + "4"))
        c = Chord(tones)
        name = c.identify()
        # Get notes for response
        out_notes = []
        for t in c.tones:
            out_notes.append({
                "name": str(t),
                "scientific": _safe_call(lambda: t.scientific, default=str(t)),
                "midi": _safe_call(lambda: t.midi, default=None),
                "frequency": _safe_call(lambda: round(t.frequency, 4), default=None),
            })
        return {"name": name, "notes": out_notes, "input": note_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/note/frequency")
def note_frequency(note: str = Query(..., description="Note name with octave, e.g. C4, A4, F#5")):
    """Get the frequency (Hz) of a note."""
    try:
        n = Note(note)
        return _note_to_dict(n)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/note/info")
def note_info(note: str = Query(..., description="Note name with octave, e.g. C4, A4")):
    """Get full info about a note."""
    try:
        n = Note(note)
        return _note_to_dict(n)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/note/convert")
def note_convert(note: str = Query(..., description="Note name with octave, e.g. C4")):
    """Convert a note to all naming systems."""
    try:
        n = Note(note)
        return {
            "input": note,
            "scientific": n.scientific,
            "helmholtz": n.helmholtz,
            "solfege": n.solfege,
            "letter": n.letter,
            "midi": n.midi,
            "frequency": round(n.frequency, 4),
            "pitch_class": n.midi % 12,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/note/from-midi")
def note_from_midi(midi: int = Query(..., description="MIDI note number, e.g. 60")):
    """Get a note from a MIDI number."""
    try:
        n = Note.from_midi(midi)
        return _note_to_dict(n)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/note/from-frequency")
def note_from_frequency(freq: float = Query(..., description="Frequency in Hz, e.g. 440")):
    """Get the nearest note to a frequency."""
    try:
        n = Note.from_frequency(freq)
        return {
            "input_frequency": freq,
            "note": str(n),
            "scientific": n.scientific,
            "midi": n.midi,
            "actual_frequency": round(n.frequency, 4),
            "cents_off": round(1200 * (freq / n.frequency if n.frequency else 1), 4) if n.frequency else None,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/note/range")
def note_range(
    start: str = Query("C0"),
    end: str = Query("C8"),
):
    """List all notes in a range (inclusive)."""
    try:
        start_n = Note(start)
        end_n = Note(end)
        out = []
        for midi in range(start_n.midi, end_n.midi + 1):
            try:
                n = Note.from_midi(midi)
                out.append(_note_to_dict(n))
            except Exception:
                pass
        return {"start": start, "end": end, "notes": out, "count": len(out)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3031, log_level="info")
