"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GuidedCreateStep {
  id: number;
  title: string;
  description: string;
}

interface GuidedCreateShellProps {
  title: string;
  description: string;
  steps: GuidedCreateStep[];
  currentStep: number;
  onBack: () => void;
  children: React.ReactNode;
  aside: React.ReactNode;
}

export function GuidedCreateShell({
  title,
  description,
  steps,
  currentStep,
  onBack,
  children,
  aside,
}: GuidedCreateShellProps) {
  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          {steps.map((step, idx) => {
            const active = currentStep === step.id;
            const complete = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-1 items-center gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-1.5 rounded-full transition-all duration-300",
                        active &&
                          "size-2.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]",
                        complete && "bg-primary/60",
                        !active && !complete && "bg-muted-foreground/30",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-medium uppercase tracking-wider transition-colors",
                        active ? "text-foreground" : "text-muted-foreground/60",
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "h-1 w-full rounded-full transition-all duration-500",
                      active && "bg-primary/20",
                      complete && "bg-primary",
                      !active && !complete && "bg-muted/50",
                    )}
                  >
                    {active && (
                      <div className="h-full w-1/2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden size-1 rounded-full bg-muted-foreground/20 md:block" />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">{children}</div>
          <aside className="space-y-4 xl:sticky xl:top-6">{aside}</aside>
        </div>
      </div>
    </div>
  );
}
