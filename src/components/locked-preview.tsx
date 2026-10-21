"use client";

import { Lock, Check, ArrowUpRight } from "lucide-react";
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
  /** Static mock of the tool UI, shown blurred behind the lock. */
  preview: React.ReactNode;
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
        <DialogContent className="bg-cream border-2 border-ink rounded-2xl noodle-shadow-lg sm:max-w-lg p-0 overflow-hidden">
          {/* Blurred preview */}
          <div className="relative h-44 bg-white border-b-2 border-ink overflow-hidden">
            <div className="absolute inset-0 p-5 blur-[3px] opacity-70 pointer-events-none select-none">
              {tool.preview}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded-full text-xs font-bold uppercase tracking-wider">
                <Lock className="h-4 w-4" />
                Members only
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
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
