import { useFormContext } from "react-hook-form";
import { Layers3, ArrowRight } from "lucide-react";
import { StepHeader } from "./step-header";
import { Button } from "@/components/ui/button";
import { InlineUnitList } from "./unit-list";
import { isMultiUnit, type PropertyFormValues } from "@/lib/schemas/property";

interface UnitsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function UnitsStep({ onNext, onBack }: UnitsStepProps) {
  const { watch, control } = useFormContext<PropertyFormValues>();
  const propertyType = watch("property_type");
  const multiUnit = isMultiUnit(propertyType);

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Layers3}
        title="Units"
        description="Configure the individual units for this property."
      />

      <div className="rounded-2xl border bg-background p-6">
        <InlineUnitList singleUnit={!multiUnit} />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
        >
          Next: Media
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
