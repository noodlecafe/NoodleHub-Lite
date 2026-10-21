# Recording the locked-tool preview clips

The clips in `public/previews/` are recorded from the **full** NoodleHub app
(not this repo), with real audio, using a scripted browser.

1. Run the full NoodleHub app on port 3001:
   `PYTHON_BIN=/path/to/venv/bin/python npx next dev -p 3001` (in the NoodleHub repo)
2. In this folder: `npm i playwright@1.55.0`
3. Record (all tools, or one id like `fretboard`):
   `CHROME_PATH=/path/to/chrome node record.mjs [tool-id]`
4. Encode to MP4 + poster JPG (needs ffmpeg): `python3 encode.py [tool-id]`
5. Copy `out/*.mp4` and `out/*.jpg` into `public/previews/`.

Each tool's demo (what gets clicked) is defined in `SCRIPTS` in `record.mjs`.
