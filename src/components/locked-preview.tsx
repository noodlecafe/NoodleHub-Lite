"use client";

import { useRef, useState } from "react";
import { Lock, Check, ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const CHECKOUT_URL = "https://whop.com/checkout/plan_hrnkCXO1bMwRs";

export interface LockedTool {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  features: string[];
  /** Recorded demo clip of the tool in action, e.g. /previews/chord-finder.mp4 */
  video: string;
  poster: string;
}

function PreviewVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Browsers only allow autoplay when muted, so start silent and let them opt in to sound.
  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !muted;
    if (muted) {
      v.currentTime = 0;
      v.play();
    }
    setMuted(!muted);
  };

  return (
    <div className="relative bg-white border-b-2 border-ink">
      <video
        ref={ref}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className="w-full max-h-[50vh] object-contain bg-white"
      />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-ink text-cream rounded-full text-[10px] font-bold uppercase tracking-wider">
        <Lock className="h-3 w-3" />
        Members preview
      </div>
      <button
        onClick={toggleSound}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-noodle-yellow border-2 border-ink rounded-full text-xs font-bold noodle-shadow-sm"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {muted ? "Tap for sound" : "Sound on"}
      </button>
    </div>
  );
}

export function LockedPreview({
  tool,
  onClose,
}: {
  tool: LockedTool | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={tool !== null} onOpenChange={(open) => !open && onClose()}>
      {tool && (
        <DialogContent className="bg-cream border-2 border-ink rounded-2xl noodle-shadow-lg sm:max-w-2xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
          <PreviewVideo key={tool.video} src={tool.video} poster={tool.poster} />

          <div className="px-6 pt-5 pb-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl border-2 border-ink flex items-center justify-center",
                  tool.accent,
                )}
              >
                {tool.icon}
              </div>
              <DialogTitle className="font-display text-3xl uppercase leading-none">
                {tool.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-ink-soft mb-4">
              {tool.description}
            </DialogDescription>

            <ul className="space-y-2 mb-6">
              {tool.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-noodle-blue shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="noodle-btn w-full flex items-center justify-center gap-2"
            >
              Join to unlock all 12 tools
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
