import type { LucideIcon } from "lucide-react";

interface StepHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function StepHeader({ icon: Icon, title, description }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold leading-none">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
