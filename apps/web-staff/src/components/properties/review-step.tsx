import { useFormContext } from "react-hook-form";
import { CheckCircle, Loader2 } from "lucide-react";
import { StepHeader } from "./step-header";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatKES } from "@emakao/shared";
import type { PropertyFormValues } from "@/lib/schemas/property";

interface ReviewStepProps {
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
  submitError: string | null;
}

export function ReviewStep({ onBack, onSubmit, isPending, submitError }: ReviewStepProps) {
  const { watch } = useFormContext<PropertyFormValues>();
  const propertyName = watch("name");
  const propertyAddress = watch("address");
  const propertyCity = watch("city");
  const unitTypes = watch("unit_types");
  const selectedAgentIds = watch("agent_ids");

  const configuredUnits = unitTypes.reduce((sum, ut) => sum + (ut.quantity || 0), 0);
  const totalScheduledRent = unitTypes.reduce(
    (sum, ut) => sum + (ut.base_rent || 0) * (ut.quantity || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <StepHeader
        icon={CheckCircle}
        title="Review"
        description="Confirm the details and publish to portfolio."
      />

      <div className="rounded-2xl border bg-background p-8 shadow-xl shadow-slate-200/50">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Property
              </Label>
              <p className="mt-1 text-xl font-bold">{propertyName}</p>
              <p className="text-sm text-muted-foreground">
                {propertyAddress}, {propertyCity}
              </p>
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Finance
              </Label>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatKES(totalScheduledRent)}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ month</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/20 p-4">
              <p className="text-2xl font-bold">{configuredUnits}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Units
              </p>
            </div>
            <div className="rounded-xl bg-muted/20 p-4">
              <p className="text-2xl font-bold">{selectedAgentIds.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Staff
              </p>
            </div>
          </div>
        </div>

        {submitError && (
          <Alert variant="destructive" className="mt-8 rounded-xl">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={isPending}
          className="rounded-xl px-12 shadow-xl shadow-primary/30"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Publishing…
            </>
          ) : (
            "Create Property"
          )}
        </Button>
      </div>
    </div>
  );
}
