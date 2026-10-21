"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI, type ToolId } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ToolShellProps {
  toolId: ToolId;
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  accent?: "blue" | "yellow" | "pink";
}

const accentMap = {
  blue: "bg-noodle-blue text-white",
  yellow: "bg-noodle-yellow text-ink",
  pink: "bg-noodle-pink text-ink",
};

export function ToolShell({
  toolId,
  title,
  description,
  children,
  icon,
  accent = "blue",
}: ToolShellProps) {
  const setTool = useUI((s) => s.setTool);
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Button
        variant="ghost"
        onClick={() => setTool("home")}
        className="mb-6 -ml-2 font-bold uppercase text-sm tracking-wider hover:bg-cream-deep"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all tools
      </Button>

      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {icon && (
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-ink noodle-shadow-sm",
                accentMap[accent],
              )}
            >
              {icon}
            </div>
          )}
          <h1 className="font-display text-lg sm:text-2xl uppercase leading-snug">
            {title}
          </h1>
        </div>
        <p className="text-ink-soft text-base sm:text-lg max-w-2xl">
          {description}
        </p>
      </header>

      <div className="tool-body noodle-card p-5 sm:p-8 noodle-shadow">{children}</div>
    </section>
  );
}
