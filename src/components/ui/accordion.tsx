"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  toggle: () => void;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(
  undefined
);

export interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  type = "single",
  defaultValue,
  children,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(itemValue) ? [] : [itemValue];
        } else {
          return prev.includes(itemValue)
            ? prev.filter((v) => v !== itemValue)
            : [...prev, itemValue];
        }
      });
    },
    [type]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        const itemValue = (child.props as { value: string }).value;
        const isOpen = openItems.includes(itemValue);
        return (
          <AccordionItemContext.Provider
            value={{
              value: itemValue,
              isOpen,
              toggle: () => toggleItem(itemValue),
            }}
          >
            {child}
          </AccordionItemContext.Provider>
        );
      })}
    </div>
  );
}

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ children, className }: AccordionItemProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card transition-all overflow-hidden shadow-xs",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const { isOpen, toggle, value } = context;
  const triggerId = `accordion-trigger-${value}`;
  const contentId = `accordion-content-${value}`;

  return (
    <button
      id={triggerId}
      type="button"
      aria-expanded={isOpen}
      aria-controls={contentId}
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between p-5 sm:p-6 text-left font-semibold text-foreground text-base transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl",
        className
      )}
    >
      <span className="pr-4">{children}</span>
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180 text-primary"
        )}
      />
    </button>
  );
}

export interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const { isOpen, value } = context;
  const triggerId = `accordion-trigger-${value}`;
  const contentId = `accordion-content-${value}`;

  if (!isOpen) return null;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn(
        "px-5 pb-5 pt-0 sm:px-6 sm:pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in-50 duration-200",
        className
      )}
    >
      <div className="pt-4">{children}</div>
    </div>
  );
}
