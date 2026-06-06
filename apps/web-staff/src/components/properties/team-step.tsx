import { useFormContext, useFieldArray } from "react-hook-form";
import { Users, Plus, Trash2, X, ArrowRight } from "lucide-react";
import { StepHeader } from "./step-header";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchSelectDialog, type SearchResult } from "../shared/search-select-dialog";
import { PersonFormDialog } from "../shared/person-form-dialog";
import type { PropertyFormValues } from "@/lib/schemas/property";

interface TeamStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function TeamStep({ onNext, onBack }: TeamStepProps) {
  const { watch, setValue, control } = useFormContext<PropertyFormValues>();
  const selectedOwnerIds = watch("owner_ids");
  const selectedAgentIds = watch("agent_ids");

  const {
    fields: newOwnersFields,
    append: appendOwner,
    remove: removeOwner,
  } = useFieldArray({
    control,
    name: "new_owners",
  });

  const {
    fields: newCaretakersFields,
    append: appendCaretaker,
    remove: removeCaretaker,
  } = useFieldArray({
    control,
    name: "new_caretakers",
  });

  const searchOwners = async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(`/api/proxy/api/v1/owners?q=${encodeURIComponent(q)}&limit=10`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((o: any) => ({
      id: o.id,
      title: `${o.first_name} ${o.last_name}`,
      subtitle: o.email,
      data: o,
    }));
  };

  const searchCaretakers = async (q: string): Promise<SearchResult[]> => {
    const res = await fetch(`/api/proxy/api/v1/caretakers?q=${encodeURIComponent(q)}&limit=10`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: any) => ({
      id: c.id,
      title: `${c.first_name} ${c.last_name}`,
      subtitle: c.email || c.phone,
      data: c,
    }));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Users}
        title="Team"
        description="Invite caretakers and owners for this property."
      />

      <div className="grid gap-6">
        {/* ── Caretakers ── */}
        <div className="rounded-2xl border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Property Caretakers
              </Label>
              <p className="text-[10px] text-muted-foreground mt-1">
                Individuals who will manage the day-to-day operations of this property.
              </p>
            </div>
            <SearchSelectDialog
              title="Search Caretakers"
              placeholder="Search by name or email..."
              searchFn={searchCaretakers}
              onSelect={(data: any) => {
                appendCaretaker({
                  first_name: data.first_name,
                  last_name: data.last_name,
                  email: data.email || "",
                  phone: data.phone || "",
                });
              }}
              inviteComponent={(closeParent) => (
                <PersonFormDialog
                  title="Invite Caretaker"
                  onAdd={(data) => {
                    appendCaretaker(data);
                    closeParent();
                  }}
                />
              )}
              trigger={
                <Button type="button" variant="outline" size="sm" className="rounded-lg h-8">
                  <Plus className="size-3 mr-1" /> Add Caretaker
                </Button>
              }
            />
          </div>

          <div className="space-y-3">
            {newCaretakersFields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-muted/10 relative group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {field.first_name[0]}
                    {field.last_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium">
                        {field.first_name} {field.last_name}
                      </p>
                      <Badge
                        variant="outline"
                        className="h-4 text-[9px] px-1 bg-primary/5 text-primary border-primary/20"
                      >
                        To Invite
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {field.email} • {field.phone || "No phone"}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  onClick={() => removeCaretaker(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {newCaretakersFields.length === 0 && (
              <div className="py-8 text-center border border-dashed rounded-xl">
                <p className="text-xs text-muted-foreground">
                  No caretakers added. Click &ldquo;Add Caretaker&rdquo; to invite someone.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Owners ── */}
        <div className="rounded-2xl border bg-background p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Property Owners
              </Label>
              <p className="text-[10px] text-muted-foreground mt-1">
                Assign existing owners or invite new ones to this property.
              </p>
            </div>
            <SearchSelectDialog
              title="Search Owners"
              placeholder="Search by name or email..."
              searchFn={searchOwners}
              onSelect={(data: any) => {
                if (!selectedOwnerIds.includes(data.id)) {
                  setValue("owner_ids", [...selectedOwnerIds, data.id]);
                }
              }}
              inviteComponent={(closeParent) => (
                <PersonFormDialog
                  title="Invite Owner"
                  onAdd={(data) => {
                    appendOwner(data);
                    closeParent();
                  }}
                />
              )}
              trigger={
                <Button type="button" variant="outline" size="sm" className="rounded-lg h-8">
                  <Plus className="size-3 mr-1" /> Add Owner
                </Button>
              }
            />
          </div>

          <div className="space-y-4">
            {selectedOwnerIds.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedOwnerIds.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                        O
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">Selected Owner</p>
                          <Badge
                            variant="outline"
                            className="h-4 text-[9px] px-1 bg-primary/10 text-primary border-primary/30"
                          >
                            Selected
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          ID: {id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => setValue("owner_ids", selectedOwnerIds.filter((oid) => oid !== id))}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {newOwnersFields.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  New Owners to Invite
                </p>
                {newOwnersFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5 relative group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                        {field.first_name[0]}
                        {field.last_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">
                            {field.first_name} {field.last_name}
                          </p>
                          <Badge
                            variant="outline"
                            className="h-4 text-[9px] px-1 bg-primary/10 text-primary border-primary/30"
                          >
                            To Invite
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {field.email} • {field.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => removeOwner(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
          Next: Review
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  );
}
