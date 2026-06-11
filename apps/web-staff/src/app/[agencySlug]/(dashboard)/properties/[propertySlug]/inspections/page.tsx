"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks";
import { Loader2, Plus } from "lucide-react";
import { usePropertyRoute } from "../property-route-context";
import { useTenants } from "@/hooks/use-tenants";
import {
  useInspections,
  useCreateInspection,
  type Inspection,
} from "@/hooks/use-inspections";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PropertyInspectionsPage() {
  const { propertyId } = usePropertyRoute();
  const { data: tenants, isLoading: isLoadingTenants } = useTenants(propertyId);
  const { data: inspections, isLoading: isLoadingInspections } = useInspections(
    { property_id: propertyId },
  );
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [isCreateInspectionOpen, setIsCreateInspectionOpen] = useState(false);
  const [createInspectionType, setCreateInspectionType] = useState<
    "move_in" | "move_out" | "routine" | "emergency"
  >("move_in");
  const [createInspectionUnitId, setCreateInspectionUnitId] = useState("");
  const [createInspectionAgreementId, setCreateInspectionAgreementId] =
    useState<string | undefined>();
  const createInspectionMutation = useCreateInspection();

  const activeTenants = tenants?.filter((t) => t.status === "active") ?? [];

  const handleCreateInspection = () => {
    if (!createInspectionUnitId) return;
    createInspectionMutation.mutate(
      {
        property_id: propertyId,
        unit_id: createInspectionUnitId,
        agreement_id: createInspectionAgreementId,
        inspection_type: createInspectionType,
        scheduled_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setIsCreateInspectionOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div>
              <CardTitle className="text-base">Inspections</CardTitle>
              <CardDescription>
                Move-in, move-out, routine, and emergency inspections
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCreateInspectionOpen(true)}
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Inspection
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingInspections ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !inspections || inspections.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No inspections on this property yet.
              </div>
            ) : (
              <div className="space-y-4">
                {inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    onClick={() => setSelectedInspection(inspection)}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/30 -mx-3 px-3 py-2 rounded-md transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium">
                        {inspection.inspection_type
                          .replace("_", " ")
                          .toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inspection.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-[10px]">
                        {inspection.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inspection Detail Dialog */}
      <Dialog
        open={!!selectedInspection}
        onOpenChange={(open) => {
          if (!open) setSelectedInspection(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Inspection</DialogTitle>
            <DialogDescription>
              {selectedInspection?.inspection_type
                .replace("_", " ")
                .toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {!selectedInspection ? null : (
            <div className="space-y-4">
              <div>
                <Badge variant="secondary">{selectedInspection.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Scheduled At
                  </Label>
                  <p className="text-base">
                    {new Date(selectedInspection.scheduled_at).toLocaleString()}
                  </p>
                </div>
                {selectedInspection.completed_at && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Completed At
                    </Label>
                    <p className="text-base">
                      {new Date(
                        selectedInspection.completed_at,
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedInspection.items.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Items
                    </Label>
                    <div className="mt-2 space-y-2">
                      {selectedInspection.items.map((item, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{item.area}</p>
                            <Badge variant="secondary">{item.condition}</Badge>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.notes}
                            </p>
                          )}
                          {item.photo_urls.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {item.photo_urls.map((url, j) => (
                                <div
                                  key={j}
                                  className="w-16 h-16 bg-gray-100 rounded border border-gray-200"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {selectedInspection.summary_notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Summary Notes
                    </Label>
                    <p className="text-base">
                      {selectedInspection.summary_notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Inspection Dialog */}
      <Dialog
        open={isCreateInspectionOpen}
        onOpenChange={(open) => setIsCreateInspectionOpen(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Inspection</DialogTitle>
            <DialogDescription>
              Schedule a new inspection for this property
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inspection Type</Label>
                <Select
                  value={createInspectionType}
                  onValueChange={(val: any) => setCreateInspectionType(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="move_in">Move-in</SelectItem>
                    <SelectItem value="move_out">Move-out</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={createInspectionUnitId}
                  onValueChange={(val) => {
                    setCreateInspectionUnitId(val ?? "");
                    const tenant = activeTenants.find((t) => t.unit_id === val);
                    setCreateInspectionAgreementId(tenant?.agreement_id);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants?.map((t) => (
                      <SelectItem key={t.unit_id} value={t.unit_id}>
                        Unit {t.unit_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateInspectionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInspection}
              disabled={!createInspectionUnitId}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
