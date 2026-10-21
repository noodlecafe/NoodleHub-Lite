import json, subprocess, sys, glob, os
meta = {}
for f in sorted(glob.glob("raw/meta*.json")): meta.update(json.load(open(f)))
os.makedirs("out", exist_ok=True)
for id, m in meta.items():
    if len(sys.argv) > 1 and id not in sys.argv[1:]: continue
    c = m["crop"]
    start, end = m["t0"] - 400, m["t1"]
    frames = [f for f in json.load(open(f"raw/{id}/frames.json"))]
    # keep the last frame before start, then everything in range
    pre = [f for f in frames if f["ts"] <= start][-1:]
    sel = pre + [f for f in frames if start < f["ts"] <= end]
    lines = ["ffconcat version 1.0"]
    for i, f in enumerate(sel):
        a = max(f["ts"], start)
        b = sel[i + 1]["ts"] if i + 1 < len(sel) else end
        lines += [f"file '{os.path.abspath(f['file'])}'", f"duration {(b - a) / 1000:.4f}"]
    lines.append(f"file '{os.path.abspath(sel[-1]['file'])}'")
    open(f"raw/{id}/list.txt", "w").write("\n".join(lines))
    vf = f"crop={c['w']}:{c['h']}:{c['x']}:{c['y']},scale=960:-2,fps=30"
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"raw/{id}/list.txt"]
    apath = f"raw/{id}.webm-audio"
    has_audio = m["audioStart"] is not None and os.path.exists(apath) \
        and subprocess.run(["ffprobe", "-v", "error", apath]).returncode == 0
    if has_audio:
        cmd += ["-ss", f"{(start - m['audioStart']) / 1000:.3f}", "-i", apath,
                "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "128k", "-af", "apad,loudnorm=I=-18:TP=-1.5:LRA=11", "-t", f"{(end - start) / 1000:.3f}"]
    cmd += ["-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"out/{id}.mp4"]
    subprocess.run(cmd, check=True)
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-ss", "1.5", "-i", f"out/{id}.mp4", "-frames:v", "1", "-q:v", "4", f"out/{id}.jpg"], check=True)
    print(id, "audio" if has_audio else "silent", len(sel), "frames", os.path.getsize(f"out/{id}.mp4") // 1024, "KB")
