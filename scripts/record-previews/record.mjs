import { chromium } from "playwright";
import { writeFileSync, mkdirSync, renameSync } from "fs";

const VW = 1100, VH = 1150;
const only = process.argv[2];
mkdirSync("raw", { recursive: true });

// Tap every node routed to the speakers into a MediaRecorder so we capture the tool's real audio.
const audioTap = () => {
  window.__rec = { chunks: [], start: null };
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    if (dest instanceof AudioDestinationNode) {
      const ctx = this.context;
      if (!ctx.__tap) {
        ctx.__tap = ctx.createMediaStreamDestination();
        // keep the stream flowing from the start so recorder time == wall time
        const osc = ctx.createConstantSource(); osc.offset.value = 0; osc.connect(ctx.__tap); osc.start();
        ctx.resume();
        const mr = new MediaRecorder(ctx.__tap.stream, { mimeType: "audio/webm;codecs=opus" });
        mr.ondataavailable = (e) => e.data.size && window.__rec.chunks.push(e.data);
        mr.start(250);
        window.__rec.start = Date.now();
        window.__rec.mr = mr;
      }
      orig.call(this, ctx.__tap);
    }
    return r;
  };
  window.__dumpAudio = async () => {
    const mr = window.__rec.mr;
    if (!mr) return null;
    await new Promise((res) => { mr.onstop = res; mr.stop(); });
    const buf = await new Blob(window.__rec.chunks).arrayBuffer();
    let s = ""; const u = new Uint8Array(buf);
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    return { b64: btoa(s), start: window.__rec.start };
  };
};

const cursorCss = `#__cur{position:fixed;z-index:99999;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;
 background:rgba(255,255,255,.9);border:2px solid #F7E35E;box-shadow:0 0 14px rgba(247,227,94,.8);pointer-events:none;transition:left .45s ease,top .45s ease,transform .12s}
 #__cur.down{transform:scale(.7)}`;

async function setup(page, title) {
  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: new RegExp("^" + title) }).first().click();
  await page.waitForTimeout(1200);
  const card = page.locator("section .noodle-card").first();
  await page.evaluate(() => {
    const c = document.querySelector("section .noodle-card");
    window.scrollTo(0, c.getBoundingClientRect().top + window.scrollY - 16);
  });
  await page.addStyleTag({ content: cursorCss + " nextjs-portal{display:none!important}" });
  await page.evaluate(([w, h]) => {
    const d = document.createElement("div"); d.id = "__cur";
    d.style.left = w / 2 + "px"; d.style.top = h / 2 + "px"; document.body.appendChild(d);
  }, [VW, VH]);
  await page.waitForTimeout(400);
  return await card.boundingBox();
}

async function moveTo(page, x, y) {
  await page.evaluate(([x, y]) => { const c = document.getElementById("__cur"); c.style.left = x + "px"; c.style.top = y + "px"; }, [x, y]);
  await page.mouse.move(x, y, { steps: 8 });
  await page.waitForTimeout(500);
}
async function clickXY(page, x, y, after = 600) {
  await moveTo(page, x, y);
  await page.evaluate(() => document.getElementById("__cur").classList.add("down"));
  await page.mouse.click(x, y);
  await page.waitForTimeout(120);
  await page.evaluate(() => document.getElementById("__cur").classList.remove("down"));
  await page.waitForTimeout(after);
}
async function click(page, locator, after) {
  const l = locator.first();
  await l.evaluate((el) => el.scrollIntoView({ block: "nearest" }), null, { timeout: 5000 });
  const b = await l.boundingBox({ timeout: 5000 });
  await clickXY(page, b.x + b.width / 2, b.y + b.height / 2, after);
}
const btn = (p, name) => p.getByRole("button", { name, exact: true });
const card = (p) => p.locator("section .noodle-card");

const SCRIPTS = {
  "chord-finder": ["Chord Finder", async (p) => {
    for (const n of ["C4", "E4", "G4", "B4"]) await click(p, btn(p, `Play ${n}`), 450);
    await click(p, btn(p, "Play"), 2200);
    await click(p, btn(p, "Clear"), 400);
    await click(p, btn(p, "D m7"), 2000);
    await click(p, btn(p, "F maj7"), 2200);
  }],
  "scale-finder": ["Scale Explorer", async (p) => {
    await click(p, btn(p, "D"), 400);
    await click(p, btn(p, "Dorian"), 600);
    await click(p, btn(p, "Play Ascending"), 4500);
    await click(p, btn(p, "A"), 400);
    await click(p, btn(p, "Harmonic Minor"), 600);
    await click(p, btn(p, "Play Ascending"), 4500);
  }],
  "circle-of-fifths": ["Circle of Fifths", async (p) => {
    for (const k of ["G", "D", "A", "Eb", "F"]) {
      const t = card(p).locator("svg g text", { hasText: new RegExp(`^${k}$`) });
      await click(p, t, 1300);
    }
  }],
  "key-finder": ["Key Finder", async (p) => {
    for (const n of ["G", "A", "B", "D", "E", "F#"]) await click(p, btn(p, n), 650);
    await p.waitForTimeout(1500);
    await click(p, btn(p, "Clear"), 400);
    for (const n of ["A", "C", "E", "G"]) await click(p, btn(p, n), 650);
    await p.waitForTimeout(1500);
  }],
  "interval-trainer": ["Interval Trainer", async (p) => {
    await click(p, btn(p, "Medium (+ P4, P5, P8)"), 500);
    for (let round = 0; round < 2; round++) {
      await click(p, btn(p, "Play Melodic"), 1800);
      await click(p, btn(p, "Play Harmonic"), 1800);
      const answers = card(p).getByRole("button", { name: /^(P|m|M)\d+ / });
      const n = await answers.count();
      await click(p, answers.nth((round * 3 + 2) % n), 1400);
      const next = card(p).getByRole("button", { name: /next/i });
      if (await next.count()) await click(p, next, 600);
    }
  }],
  "bpm-tapper": ["BPM Tapper", async (p) => {
    const tap = btn(p, "TAP").first();
    const b = await tap.boundingBox();
    await moveTo(p, b.x + b.width / 2, b.y + b.height / 2);
    for (let i = 0; i < 12; i++) {
      await p.evaluate(() => document.getElementById("__cur").classList.add("down"));
      await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      await p.evaluate(() => document.getElementById("__cur").classList.remove("down"));
      await p.waitForTimeout(500 - 15);
    }
    await p.waitForTimeout(1500);
  }],
  "note-frequency": ["Note Frequency", async (p) => {
    await click(p, btn(p, "A4"), 400);
    await click(p, card(p).getByRole("button", { name: /^Play / }), 1600);
    await click(p, btn(p, "E4"), 400);
    await click(p, card(p).getByRole("button", { name: /^Play / }), 1600);
    await click(p, card(p).getByRole("button", { name: /^Low E/ }), 1000);
    await click(p, card(p).getByRole("button", { name: /^Middle C/ }), 1200);
  }],
  "note-converter": ["Note Name Converter", async (p) => {
    for (const n of ["C4", "E4", "G#4"]) {
      await click(p, btn(p, n), 500);
      await click(p, card(p).getByRole("button", { name: /^Play / }).first(), 1400);
    }
  }],
  fretboard: ["Fretboard Visualizer", async (p) => {
    await click(p, btn(p, "A"), 500);
    await click(p, btn(p, "Minor Pentatonic"), 1500);
    await click(p, btn(p, "Blues"), 900);
    const roots = card(p).locator('svg g.cursor-pointer:has(circle[fill="#F7E35E"])');
    for (const i of [0, 2, 4, 6]) await click(p, roots.nth(i), 750);
    await click(p, btn(p, "E"), 500);
    await click(p, btn(p, "Mixolydian"), 1500);
    await click(p, p.getByRole("button", { name: /^chord$/i }), 1800);
  }],
};

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const meta = {};
for (const [id, [title, run]] of Object.entries(SCRIPTS)) {
  if (only && only !== id) continue;
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH } });
  await ctx.addInitScript(audioTap);
  const videoStart = Date.now();
  const page = await ctx.newPage();
  try {
    const box = await setup(page, title);
    // CDP screencast: every frame carries its wall-clock timestamp, so audio sync is exact.
    mkdirSync(`raw/${id}`, { recursive: true });
    const cdp = await ctx.newCDPSession(page);
    const frames = [];
    cdp.on("Page.screencastFrame", async (f) => {
      const file = `raw/${id}/${String(frames.length).padStart(5, "0")}.jpg`;
      writeFileSync(file, Buffer.from(f.data, "base64"));
      frames.push({ file, ts: f.metadata.timestamp * 1000 });
      cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: VW, maxHeight: VH });
    await page.waitForTimeout(600);
    const t0 = Date.now();
    await run(page);
    await page.waitForTimeout(500);
    const t1 = Date.now();
    await cdp.send("Page.stopScreencast");
    const endBox = await page.locator("section .noodle-card").first().boundingBox();
    box.height = Math.max(box.height, endBox.y + endBox.height - box.y);
    const audio = await page.evaluate(() => window.__dumpAudio());
    writeFileSync(`raw/${id}/frames.json`, JSON.stringify(frames));
    if (audio) writeFileSync(`raw/${id}.webm-audio`, Buffer.from(audio.b64, "base64"));
    meta[id] = { t0, t1, audioStart: audio ? audio.start : null,
      crop: { x: Math.max(0, Math.round(box.x)), y: Math.max(0, Math.round(box.y)), w: Math.round(box.width), h: Math.min(Math.round(box.height), VH - Math.round(box.y)) } };
    console.log(id, JSON.stringify(meta[id]));
  } catch (e) { console.log(id, "FAILED", e.message.split("\n")[0]); }
  await ctx.close();
}
await browser.close();
writeFileSync(only ? `raw/meta-${only}.json` : "raw/meta.json", JSON.stringify(meta, null, 1));
