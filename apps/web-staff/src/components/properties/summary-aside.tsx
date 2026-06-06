import { useFormContext } from "react-hook-form";
import { MapPin, Layers3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatKES } from "@emakao/shared";
import type { PropertyFormValues } from "@/lib/schemas/property";

interface SummaryAsideProps {
  progressLabel: string;
}

function getRentRange(unitTypes: PropertyFormValues["unit_types"]) {
  const rentValues = unitTypes
    .map((ut) => ut.base_rent)
    .filter((rent): rent is number => rent !== undefined && Number.isFinite(rent) && rent > 0);

  if (rentValues.length === 0) {
    return "Not set";
  }

  const min = Math.min(...rentValues);
  const max = Math.max(...rentValues);

  return min === max ? formatKES(min) : `${formatKES(min)} - ${formatKES(max)}`;
}

export function SummaryAside({ progressLabel }: SummaryAsideProps) {
  const { watch } = useFormContext<PropertyFormValues>();
  const propertyName = watch("name");
  const propertyCity = watch("city");
  const unitTypes = watch("unit_types");
  const photos = watch("photos");
  const documents = watch("documents");
  const selectedAgentIds = watch("agent_ids");

  const configuredUnits = unitTypes.reduce((sum, ut) => sum + (ut.quantity || 0), 0);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-2xl">
        <CardHeader className="pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {progressLabel}
          </p>
          <CardTitle className="text-xl">{propertyName || "New Property"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MapPin className="size-3.5" />
              <span>{propertyCity || "Location pending"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Layers3 className="size-3.5" />
              <span>{configuredUnits} Units configured</span>
            </div>
          </div>

          <div className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">Rent Range</span>
              <span className="text-sm font-semibold">{getRentRange(unitTypes)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl border bg-background/50 p-4 backdrop-blur-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/50">
          Quick Stats
        </h4>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Photos</span>
            <span className="font-medium">{photos.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Documents</span>
            <span className="font-medium">{documents.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Agents</span>
            <span className="font-medium">{selectedAgentIds.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
