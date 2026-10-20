"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Info,
  Wrench,
  FileText,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequestWizardStore } from "@/stores/use-request-wizard-store";
import { useSession } from "@/components/providers/session-provider";
import { RequestPriority } from "@/lib/api/types";
import type { MechanicSkill } from "@/lib/validations/public";
import type { AssistantUrgency, AssistantResponseData } from "@/lib/ai/rules";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  data?: AssistantResponseData;
  source?: "ai" | "rules";
  redacted?: boolean;
}

const EXAMPLE_PROMPTS = [
  "My car battery seems completely dead, clicking sound when starting",
  "I have a flat tire on the highway and need help changing it safely",
  "Engine is smoking and overheating, pulled over on the shoulder",
];

// ---------------------------------------------------------------------------
// Helper: Map Assistant Urgency to RequestPriority
// ---------------------------------------------------------------------------

function mapUrgencyToPriority(urgency: AssistantUrgency | null | undefined): RequestPriority {
  switch (urgency) {
    case "EMERGENCY":
      return "EMERGENCY";
    case "HIGH":
      return "HIGH";
    case "LOW":
      return "LOW";
    case "NORMAL":
    default:
      return "NORMAL";
  }
}

// ---------------------------------------------------------------------------
// Urgency Badge Component
// ---------------------------------------------------------------------------

function UrgencyBadge({ urgency }: { urgency: AssistantUrgency | null }) {
  if (!urgency) return null;

  switch (urgency) {
    case "EMERGENCY":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          <Flame className="w-3.5 h-3.5" />
          EMERGENCY
        </span>
      );
    case "HIGH":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          HIGH URGENCY
        </span>
      );
    case "NORMAL":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          NORMAL
        </span>
      );
    case "LOW":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          <Info className="w-3.5 h-3.5" />
          LOW URGENCY
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// AssistantPanel Component
// ---------------------------------------------------------------------------

export interface AssistantPanelProps {
  className?: string;
  initialMessage?: string;
  onClose?: () => void;
}

export function AssistantPanel({ className, initialMessage, onClose }: AssistantPanelProps) {
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const { updateDraft, setStep } = useRequestWizardStore();

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am your RoadResQ assistant. Tell me what's going on with your vehicle and where you are, and I'll help you stay safe and connect with the right help.",
      data: {
        reply: "Hello! I am your RoadResQ assistant. Tell me what's going on with your vehicle.",
        urgency: "LOW",
        safetySteps: [
          "Switch on your hazard lights if stopped by the road.",
          "Ensure you and any passengers are in a safe location away from moving traffic.",
        ],
        suggestedSkills: [],
        requestDescription: null,
        followUps: ["I have a flat tire", "My battery is dead"],
      },
      source: "rules",
    },
  ]);

  const [input, setInput] = React.useState(initialMessage || "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [redactionNotice, setRedactionNotice] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messageIdCounterRef = React.useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    if (trimmed.length > 500) {
      setErrorMessage("Message exceeds 500 characters limit.");
      return;
    }

    setErrorMessage(null);
    setRedactionNotice(false);

    messageIdCounterRef.current += 1;
    const msgId = messageIdCounterRef.current;
    const userMessage: ChatMessage = {
      id: `u-${msgId}`,
      role: "user",
      text: trimmed,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Build messages payload (up to last 8 messages)
      const payloadMessages = newMessages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const json = await res.json();

      if (json.meta?.redacted) {
        setRedactionNotice(true);
      }

      if (res.status === 429) {
        setErrorMessage("Rate limit reached: Basic suggestions shown (AI unavailable).");
      }

      messageIdCounterRef.current += 1;
      const resId = messageIdCounterRef.current;

      if (json.success && json.data) {
        const assistantMessage: ChatMessage = {
          id: `a-${resId}`,
          role: "assistant",
          text: json.data.reply,
          data: json.data,
          source: json.meta?.source || "rules",
          redacted: json.meta?.redacted,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Friendly degradation
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${resId}`,
            role: "assistant",
            text: "Sorry, I had trouble processing that request right now. Please keep your hazard lights on and check nearby mechanics or 999 if in immediate danger.",
            source: "rules",
          },
        ]);
      }
    } catch {
      messageIdCounterRef.current += 1;
      const errId = messageIdCounterRef.current;
      setErrorMessage("Network issue connecting to assistant. Rule-based suggestions are available.");
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${errId}`,
          role: "assistant",
          text: "Network error. Please stay safe, turn on your hazard lights, and proceed directly to browse mechanics or call emergency services if stranded.",
          source: "rules",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleStartRequest = (description: string | null, urgency: AssistantUrgency | null) => {
    // Write description & priority into existing request-wizard Zustand draft
    // Never touch vehicle or location; reset to step 1
    const priority = mapUrgencyToPriority(urgency);
    updateDraft({
      description: description || undefined,
      priority,
    });
    setStep(1);

    if (onClose) onClose();

    if (isAuthenticated) {
      router.push("/customer/requests/new");
    } else {
      router.push("/login?next=/customer/requests/new");
    }
  };

  const handleFindMechanics = (skill?: MechanicSkill) => {
    if (onClose) onClose();
    if (skill) {
      router.push(`/mechanics?skill=${encodeURIComponent(skill)}`);
    } else {
      router.push("/mechanics");
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "Conversation cleared. How can I assist you with your roadside emergency or vehicle question?",
        source: "rules",
      },
    ]);
    setInput("");
    setErrorMessage(null);
    setRedactionNotice(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background text-foreground overflow-hidden",
        className
      )}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-tight">Breakdown Assistant</h2>
            <p className="text-[11px] text-muted-foreground">Triage, safety advice & platform guide</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
            title="Clear conversation"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-muted/60 px-4 py-2 border-b text-[11px] text-muted-foreground flex items-center justify-between gap-2 shrink-0">
        <span>⚠ AI suggestions, not a diagnosis. Do not enter personal data.</span>
      </div>

      {/* Redaction Notice */}
      {redactionNotice && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Personal information (emails, phone numbers, URLs) was redacted for your privacy.</span>
        </div>
      )}

      {/* Messages List with aria-live */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
        role="log"
        aria-label="Breakdown Assistant Chat"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-1.5 max-w-[88%]", isUser ? "ml-auto items-end" : "mr-auto items-start")}
            >
              {/* Message Bubble */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl text-sm leading-relaxed",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-xs shadow-xs"
                    : "bg-card border text-card-foreground rounded-bl-xs shadow-xs"
                )}
              >
                {/* Assistant metadata header */}
                {!isUser && msg.data?.urgency && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/60">
                    <UrgencyBadge urgency={msg.data.urgency} />
                    {msg.source === "rules" && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Basic suggestions (AI unavailable)
                      </span>
                    )}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Safety steps list */}
                {!isUser && msg.data?.safetySteps && msg.data.safetySteps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <p className="text-xs font-semibold mb-1.5 flex items-center gap-1.5 text-foreground">
                      <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                      Immediate Safety Steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                      {msg.data.safetySteps.map((step, idx) => (
                        <li key={idx} className="leading-snug">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Suggested skills */}
                {!isUser && msg.data?.suggestedSkills && msg.data.suggestedSkills.length > 0 && (
                  <div className="mt-3 pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground mr-1">Skills needed:</span>
                    {msg.data.suggestedSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-[11px] py-0 px-2 font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {!isUser && msg.data && (
                  <div className="mt-3.5 pt-2.5 border-t border-border/60 flex flex-wrap gap-2">
                    {msg.data.suggestedSkills && msg.data.suggestedSkills.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-medium"
                        onClick={() => handleFindMechanics(msg.data?.suggestedSkills[0])}
                      >
                        <Wrench className="w-3.5 h-3.5 mr-1 text-primary" />
                        Find matching mechanics
                      </Button>
                    )}

                    <Button
                      size="sm"
                      className="h-8 text-xs font-medium"
                      onClick={() =>
                        handleStartRequest(
                          msg.data?.requestDescription || msg.text,
                          msg.data?.urgency || null
                        )
                      }
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      Start request with this description
                    </Button>
                  </div>
                )}
              </div>

              {/* Follow-up chips below assistant bubble */}
              {!isUser && msg.data?.followUps && msg.data.followUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {msg.data.followUps.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="text-xs bg-card hover:bg-muted text-muted-foreground hover:text-foreground border rounded-full px-3 py-1 transition-colors text-left"
                    >
                      {chip} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-card border rounded-2xl w-fit text-sm text-muted-foreground rounded-bl-xs">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Analyzing breakdown & safety steps...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Chips */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 py-2 border-t bg-muted/30 shrink-0">
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Common scenarios:</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-xs bg-card hover:bg-muted border rounded-xl px-2.5 py-1 text-muted-foreground hover:text-foreground text-left transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error banner if any */}
      {errorMessage && (
        <div className="px-4 py-1.5 bg-destructive/10 text-destructive text-xs border-t border-destructive/20 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="underline font-medium ml-2">
            dismiss
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t bg-card shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex flex-col gap-2"
        >
          <div className="relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="Describe what happened (e.g. flat tire, steam from engine)..."
              disabled={isLoading}
              className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className={cn(input.length >= 480 && "text-destructive font-semibold")}>
                {input.length}
              </span>
              /500 • <kbd className="font-mono text-[10px]">Enter</kbd> sends, <kbd className="font-mono text-[10px]">Shift+Enter</kbd> new line
            </span>

            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="h-8 px-3 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1" />
              )}
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
