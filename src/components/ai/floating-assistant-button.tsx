"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Dynamically import AssistantPanel so it adds nothing to the first load bundle
const DynamicAssistantPanel = dynamic(
  () =>
    import("@/components/ai/assistant-panel").then((mod) => mod.AssistantPanel),
  {
    loading: () => (
      <div className="flex h-full w-full items-center justify-center p-8 text-sm text-muted-foreground">
        Loading assistant...
      </div>
    ),
    ssr: false,
  }
);

export function FloatingAssistantButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Floating button positioned safely above bottom navigation (bottom-20 on mobile, bottom-6 on desktop) */}
      <aside aria-label="Breakdown Assistant Helper">
        <Button
          onClick={() => setOpen(true)}
          className={cn(
            "fixed z-30 bottom-20 md:bottom-6 right-4 sm:right-6 md:right-8",
            "h-12 px-4 rounded-full shadow-lg border border-primary/20",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "flex items-center gap-2 font-medium text-sm"
          )}
          aria-label="Open Breakdown helper assistant"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Breakdown helper</span>
        </Button>
      </aside>

      {/* Slide-over Sheet with chat panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-card overflow-hidden"
          showCloseButton={true}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>RoadResQ Breakdown Assistant</SheetTitle>
            <SheetDescription>
              Triage roadside emergencies, view safety instructions, and connect with mechanics.
            </SheetDescription>
          </SheetHeader>

          {open && (
            <DynamicAssistantPanel
              className="h-full w-full border-none"
              onClose={() => setOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
