import { Metadata } from "next";
import { Sparkles, Shield, Wrench, AlertTriangle } from "lucide-react";
import { AssistantPanel } from "@/components/ai/assistant-panel";

export const metadata: Metadata = {
  title: "Breakdown Assistant",
  description:
    "Get instant roadside breakdown triage, urgent safety steps, and mechanic recommendations with the RoadResQ assistant.",
};

export default function AssistantPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
      {/* Header section */}
      <div className="mb-8 text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Roadside Triage & Safety Helper</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          AI Breakdown Assistant
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Describe your vehicle symptoms or emergency situation. We will assess the urgency,
          provide immediate safety steps, and help you request the right mechanic on RoadResQ.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Cards (Desktop) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
          <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-xs space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-semibold text-sm">
              <Shield className="w-4 h-4" />
              <span>Safety First Protocol</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If your vehicle is smoking, on fire, or in live traffic lanes, prioritize getting
              passengers to safety and calling <strong>999</strong> immediately.
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-xs space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-primary font-semibold text-sm">
              <Wrench className="w-4 h-4" />
              <span>Direct Mechanic Dispatch</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              One-click transfer of your issue description directly into a verified RoadResQ
              service request with pre-set urgency levels.
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-xs space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-muted-foreground font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Private & Safe</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All personal data (names, phone numbers, emails) is automatically redacted before AI
              processing.
            </p>
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="lg:col-span-8 border rounded-2xl shadow-sm bg-card overflow-hidden h-[620px] sm:h-[680px]">
          <AssistantPanel className="h-full" />
        </div>
      </div>
    </div>
  );
}
