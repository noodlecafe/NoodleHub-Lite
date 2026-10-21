import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLI_PATH = path.join(process.cwd(), "scripts", "pytheory_cli.py");
const PYTHON_BIN = process.env.PYTHON_BIN || "python3";

// Simple in-memory cache (process-lifetime) to avoid re-computing the same thing twice
const cache = new Map<string, { value: any; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PyTheoryRequest {
  fn: string;
  args?: Record<string, unknown>;
}

function callPython(fn: string, args: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    const argsJson = JSON.stringify(args || {});
    const proc = spawn(PYTHON_BIN, [CLI_PATH, fn, argsJson], {
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1", PYTHONUNBUFFERED: "1" },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn python: ${err.message}`));
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python exited with ${code}: ${stderr || stdout}`));
        return;
      }
      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          reject(new Error(result.error));
          return;
        }
        resolve(result);
      } catch (e) {
        reject(new Error(`Invalid JSON from python: ${stdout.slice(0, 500)}`));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  let body: PyTheoryRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.fn) {
    return NextResponse.json({ error: "Missing 'fn' field" }, { status: 400 });
  }

  const cacheKey = `${body.fn}:${JSON.stringify(body.args || {})}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.value);
  }

  try {
    const result = await callPython(body.fn, body.args || {});
    cache.set(cacheKey, { value: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Allow GET for simple queries via query params: ?fn=health
  const url = new URL(request.url);
  const fn = url.searchParams.get("fn");
  if (!fn) {
    return NextResponse.json({
      service: "NoodleHub PyTheory API",
      usage: "POST { fn: 'function_name', args: {...} }",
      functions: [
        "health",
        "available_scales",
        "get_scale?tonic=C&mode=major",
        "all_keys",
        "detect_key?notes=C,E,G",
        "circle_of_fifths",
        "common_progressions?tonic=C&mode=major",
        "build_progression?tonic=C&mode=major&numerals=I,V,vi,IV",
        "identify_chord?notes=C,E,G",
        "note_info?note=A4",
        "note_convert?note=A4",
        "note_from_midi?midi=60",
        "note_from_frequency?freq=440",
      ],
    });
  }

  // Parse args from query params (skip fn)
  const args: Record<string, unknown> = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (k === "fn") continue;
    // Try to parse JSON, fall back to string
    try {
      args[k] = JSON.parse(v);
    } catch {
      args[k] = v;
    }
  }

  // Special case: notes and numerals are comma-separated strings
  if (typeof args.notes === "string") {
    args.notes = (args.notes as string).split(",").map((s) => s.trim());
  }
  if (typeof args.numerals === "string") {
    args.numerals = (args.numerals as string).split(",").map((s) => s.trim());
  }
  if (typeof args.midi === "string") args.midi = parseInt(args.midi);
  if (typeof args.freq === "string") args.freq = parseFloat(args.freq);

  const cacheKey = `GET:${fn}:${JSON.stringify(args)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.value);
  }

  try {
    const result = await callPython(fn, args);
    cache.set(cacheKey, { value: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
