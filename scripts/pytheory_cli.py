#!/usr/bin/env python3
"""
NoodleHub PyTheory CLI helper.
Called via `python3 pytheory_cli.py <function> <args_json>` from a Next.js API route.

Returns JSON to stdout. Errors go to stderr and exit with non-zero code.
"""
import sys
import json
import pytheory
from pytheory import Key, Note, Chord, TonedScale, Tone


def note_to_dict(n):
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


def chord_to_dict(c):
    name = "unknown"
    try:
        name = c.identify()
    except Exception:
        pass
    notes = []
    try:
        for t in c.tones:
            notes.append({
                "name": str(t),
                "scientific": getattr(t, "scientific", str(t)),
                "midi": getattr(t, "midi", None),
                "frequency": round(t.frequency, 4) if hasattr(t, "frequency") and t.frequency else None,
            })
    except Exception:
        pass
    return {"name": name, "notes": notes}


def safe(fn, default=None):
    try:
        return fn()
    except Exception:
        return default


def handle_health(args):
    return {"status": "ok", "pytheory_version": pytheory.__version__}


def handle_available_scales(args):
    ts = TonedScale(tonic="C")
    return {"scales": list(ts.scales)}


def handle_get_scale(args):
    tonic = args["tonic"]
    mode = args["mode"]
    k = Key(tonic, mode)
    sig = safe(lambda: k.signature(), default={}) or {}
    note_names = safe(lambda: k.note_names, default=[]) or []
    chords = safe(lambda: k.chords, default=[]) or []
    seventh = safe(lambda: k.seventh_chords, default=[]) or []
    scale_notes = []
    for nm in note_names:
        try:
            n = Note(nm + "4")
            scale_notes.append(note_to_dict(n))
        except Exception:
            pass
    return {
        "tonic": tonic,
        "mode": mode,
        "note_names": list(note_names),
        "notes": scale_notes,
        "chords": list(chords),
        "seventh_chords": list(seventh),
        "signature": {
            "sharps": sig.get("sharps", 0) if isinstance(sig, dict) else 0,
            "flats": sig.get("flats", 0) if isinstance(sig, dict) else 0,
        },
    }


def handle_all_keys(args):
    out = []
    for k in Key.all_keys():
        sig = safe(lambda: k.signature(), default={}) or {}
        out.append({
            "tonic": str(k.tonic_name) if hasattr(k, "tonic_name") else "C",
            "mode": k.mode if hasattr(k, "mode") else "major",
            "note_names": list(safe(lambda: k.note_names, default=[]) or []),
            "chords": list(safe(lambda: k.chords, default=[]) or []),
            "seventh_chords": list(safe(lambda: k.seventh_chords, default=[]) or []),
            "signature": {
                "sharps": sig.get("sharps", 0) if isinstance(sig, dict) else 0,
                "flats": sig.get("flats", 0) if isinstance(sig, dict) else 0,
            },
        })
    return {"keys": out}


def handle_detect_key(args):
    notes = args["notes"]
    k = Key.detect(*notes)
    if k is None:
        return {"key": None, "tonic": None, "mode": None}
    sig = safe(lambda: k.signature(), default={}) or {}
    return {
        "key": str(k),
        "tonic": str(k.tonic_name) if hasattr(k, "tonic_name") else "C",
        "mode": k.mode if hasattr(k, "mode") else "major",
        "note_names": list(safe(lambda: k.note_names, default=[]) or []),
        "chords": list(safe(lambda: k.chords, default=[]) or []),
        "seventh_chords": list(safe(lambda: k.seventh_chords, default=[]) or []),
        "signature": {
            "sharps": sig.get("sharps", 0) if isinstance(sig, dict) else 0,
            "flats": sig.get("flats", 0) if isinstance(sig, dict) else 0,
        },
    }


def handle_circle_of_fifths(args):
    fifths_major = [
        ("C", 0), ("G", 1), ("D", 2), ("A", 3), ("E", 4), ("B", 5), ("F#", 6),
        ("C", 0), ("F", 1), ("Bb", 2), ("Eb", 3), ("Ab", 4), ("Db", 5), ("Gb", 6),
    ]
    fifths_minor = [
        ("A", 0), ("E", 1), ("B", 2), ("F#", 3), ("C#", 4), ("G#", 5), ("D#", 6),
        ("A", 0), ("D", 1), ("G", 2), ("C", 3), ("F", 4), ("Bb", 5), ("Eb", 6),
    ]
    return {
        "major": fifths_major,
        "minor": fifths_minor,
        "explanation": "Circle of fifths: each step is a perfect fifth. Sharps accumulate clockwise from C; flats counter-clockwise.",
    }


def handle_common_progressions(args):
    tonic = args["tonic"]
    mode = args["mode"]
    k = Key(tonic, mode)
    cps = safe(lambda: k.common_progressions(), default={}) or {}
    out = []
    if isinstance(cps, dict):
        for prog_name, chords in cps.items():
            chord_dicts = [chord_to_dict(c) for c in chords]
            out.append({"name": prog_name, "chords": chord_dicts})
    return {"tonic": tonic, "mode": mode, "progressions": out}


def handle_build_progression(args):
    tonic = args["tonic"]
    mode = args["mode"]
    numerals = args["numerals"]
    k = Key(tonic, mode)
    prog = k.progression(*numerals)
    chord_dicts = [chord_to_dict(c) for c in prog]
    return {"tonic": tonic, "mode": mode, "numerals": numerals, "chords": chord_dicts}


def handle_identify_chord(args):
    notes = args["notes"]
    tones = [Tone(nm + "4") for nm in notes]
    c = Chord(tones)
    result = chord_to_dict(c)
    result["input"] = notes
    return result


def handle_note_info(args):
    note = args["note"]
    n = Note(note)
    return note_to_dict(n)


def handle_note_convert(args):
    note = args["note"]
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


def handle_note_from_midi(args):
    midi = args["midi"]
    n = Note.from_midi(midi)
    return note_to_dict(n)


def handle_note_from_frequency(args):
    freq = args["freq"]
    n = Note.from_frequency(freq)
    actual = n.frequency if hasattr(n, "frequency") else None
    cents = round(1200 * (freq / actual if actual else 1), 4) if actual else None
    return {
        "input_frequency": freq,
        "note": str(n),
        "scientific": getattr(n, "scientific", str(n)),
        "midi": getattr(n, "midi", None),
        "actual_frequency": round(actual, 4) if actual else None,
        "cents_off": cents,
    }


HANDLERS = {
    "health": handle_health,
    "available_scales": handle_available_scales,
    "get_scale": handle_get_scale,
    "all_keys": handle_all_keys,
    "detect_key": handle_detect_key,
    "circle_of_fifths": handle_circle_of_fifths,
    "common_progressions": handle_common_progressions,
    "build_progression": handle_build_progression,
    "identify_chord": handle_identify_chord,
    "note_info": handle_note_info,
    "note_convert": handle_note_convert,
    "note_from_midi": handle_note_from_midi,
    "note_from_frequency": handle_note_from_frequency,
}


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: pytheory_cli.py <function> <args_json>"}))
        sys.exit(1)

    fn_name = sys.argv[1]
    try:
        args = json.loads(sys.argv[2])
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON args: {e}"}))
        sys.exit(1)

    handler = HANDLERS.get(fn_name)
    if not handler:
        print(json.dumps({"error": f"Unknown function: {fn_name}"}))
        sys.exit(1)

    try:
        result = handler(args)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
