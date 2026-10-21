/**
 * Pixel-art record sleeves with little nods to records we love.
 * Original pixel drawings in the spirit of each album, not reproductions of the artwork.
 */

import { cn } from "@/lib/utils";

type Px = [number, number, string];

function line(x0: number, y0: number, x1: number, y1: number, c: string): Px[] {
  const out: Px[] = [];
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    out.push([Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), c]);
  }
  return out;
}

function Pixels({ w, h, px, bg }: { w: number; h: number; px: Px[]; bg: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" className="w-full h-full block">
      <rect width={w} height={h} fill={bg} />
      {px.map(([x, y, c], i) =>
        x >= 0 && x < w && y >= 0 && y < h ? <rect key={i} x={x} y={y} width="1.02" height="1.02" fill={c} /> : null,
      )}
    </svg>
  );
}

function fromMap(rows: string[], palette: Record<string, string>, ox = 0, oy = 0): Px[] {
  const out: Px[] = [];
  rows.forEach((r, y) => [...r].forEach((ch, x) => palette[ch] && out.push([x + ox, y + oy, palette[ch]])));
  return out;
}

/** Light through a prism. */
function Prism() {
  const W = 24, H = 24;
  const o = 5;
  const rainbow = ["#FF3B3B", "#FF9F1C", "#F7E35E", "#4ADE80", "#38BDF8", "#A78BFA"];
  const px: Px[] = [
    ...line(0, 10 + o, 4, 8 + o, "#FFFFFF"),
    ...line(0, 11 + o, 4, 9 + o, "#FFFFFF"),
    ...line(5, 8 + o, 11, 7 + o, "rgba(255,255,255,0.35)"),
    ...rainbow.flatMap((c, i) => line(12, 7 + o + i * 0.4, 20, 3 + o + i * 1.8, c)),
    ...line(8, 2 + o, 0, 13 + o, "#E8E4F0"),
    ...line(8, 2 + o, 16, 13 + o, "#E8E4F0"),
    ...line(0, 13 + o, 16, 13 + o, "#E8E4F0"),
  ];
  return <Pixels w={W} h={H} px={px} bg="#0B0B0E" />;
}

/** Cold, jagged peaks. */
function Peaks() {
  const W = 24, H = 24;
  const heights = [4, 6, 9, 13, 10, 7, 12, 16, 15, 10, 6, 9, 15, 18, 13, 9, 7, 10, 13, 9, 6, 4, 3, 3];
  const px: Px[] = [];
  heights.forEach((hgt, x) => {
    for (let k = 0; k < hgt; k++) {
      const y = H - 1 - k;
      px.push([x, y, k === hgt - 1 ? "#FFFFFF" : k > hgt - 4 ? "#BFE0F5" : k > 2 ? "#7FA9D6" : "#4C6E9E"]);
    }
  });
  px.push([4, 3, "#F0347E"], [5, 3, "#F0347E"], [4, 4, "#F0347E"], [5, 4, "#F0347E"]);
  return <Pixels w={W} h={H} px={px} bg="#C2382F" />;
}

/** Green hair, shower tiles. */
function Blond() {
  const W = 16, H = 16;
  const tiles: Px[] = [];
  for (let i = 0; i < W; i += 4) for (let y = 0; y < H; y++) tiles.push([i, y, "#B8C4C9"]);
  for (let j = 0; j < H; j += 4) for (let x = 0; x < W; x++) tiles.push([x, j, "#B8C4C9"]);
  const face = fromMap(
    [
      "....gggggg....",
      "..gggggggggg..",
      ".gggggggggggg.",
      ".ggssssssssgg.",
      "..ssssssssss..",
      "..ssdssssdss..",
      "..ssssssssss..",
      "..ssssmmssss..",
      "...ssssssss...",
      "....ssssss....",
      ".....ssss.....",
      "...ssssssss...",
      "..ssssssssss..",
      "..ssssssssss..",
    ],
    { g: "#86E05A", s: "#9A6646", d: "#2B1B12", m: "#5C3523" },
    1,
    2,
  );
  return <Pixels w={W} h={H} px={[...tiles, ...face]} bg="#DCE4E8" />;
}

const SLEEVES = [
  { art: <Prism />, caption: "Wish You Were Here", tilt: "-rotate-6", pos: "z-10" },
  { art: <Peaks />, caption: "Everything In Its Right Place", tilt: "rotate-2", pos: "z-20 -ml-3 -mt-3" },
  { art: <Blond />, caption: "Pink + White", tilt: "rotate-[8deg]", pos: "z-10 -ml-3" },
];

/** A little crate of fanned-out pixel record sleeves. Hover one to read its track. */
export function RecordCrate() {
  return (
    <div className="flex items-center justify-center py-4">
      {SLEEVES.map((s) => (
        <div
          key={s.caption}
          title={s.caption}
          className={cn(
            "group/sleeve relative w-24 h-24 sm:w-32 sm:h-32 rounded-md transition-transform duration-300 hover:-translate-y-3 hover:rotate-0 hover:z-30",
            s.tilt,
            s.pos,
          )}
        >
          <div className="relative w-full h-full rounded-md overflow-hidden ring-1 ring-white/15 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.9)]">{s.art}</div>
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap pixel-chip bg-coal text-noodle-yellow border border-ink opacity-0 group-hover/sleeve:opacity-100 transition-opacity">
            {s.caption}
          </span>
        </div>
      ))}
    </div>
  );
}
