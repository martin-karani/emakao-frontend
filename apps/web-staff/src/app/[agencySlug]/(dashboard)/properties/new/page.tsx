"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePropertyDto } from "@emakao/api-types";

import {
  GuidedCreateShell,
  type GuidedCreateStep,
} from "@/components/shared/guided-create-shell";
import { useCreateProperty } from "@/hooks/use-properties";
import { toast } from "sonner";
import type { FieldError, Resolver } from "react-hook-form";

import {
  propertySchema,
  type PropertyFormValues,
} from "@/lib/schemas/property";

import { BasicsStep } from "@/components/properties/basics-step";
import { UnitsStep } from "@/components/properties/units-step";
import { MediaStep } from "@/components/properties/media-step";
import { TeamStep } from "@/components/properties/team-step";
import { ReviewStep } from "@/components/properties/review-step";
import { SummaryAside } from "@/components/properties/summary-aside";

const STEPS: GuidedCreateStep[] = [
  { id: 1, title: "Project", description: "Basic info" },
  { id: 2, title: "Units", description: "Unit setup" },
  { id: 3, title: "Media", description: "Photos/Docs" },
  { id: 4, title: "Team", description: "Assignment" },
  { id: 5, title: "Charges", description: "Service charges" },
  { id: 6, title: "Review", description: "Finalize" },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const { agencySlug } = useParams<{ agencySlug: string }>();
  const [step, setStep] = useState<number>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [keyToUrl, setKeyToUrl] = useState<Record<string, string>>({});
  const createProperty = useCreateProperty();

  const methods = useForm<PropertyFormValues>({
    resolver: zodResolver(
      propertySchema,
    ) as unknown as Resolver<PropertyFormValues>,
    defaultValues: {
      name: "",
      address: "",
      city: "",
      property_type: "residential",
      config: { type: "single_family" },
      unit_types: [],
      photos: [],
      documents: [],
      owner_ids: [],
      agent_ids: [],
      new_owners: [],
      new_caretakers: [],
      policies: {
        service_charges: {
          enabled: false,
          security_fee_kes: 0,
          water_rate_per_unit: 0,
          garbage_fee_kes: 0,
          electricity_common_kes: 0,
          other_fees: [],
        },
      },
    },
  });

  const {
    handleSubmit,
    trigger,
    setError,
    formState: { isSubmitting },
  } = methods;

  const getProgressLabel = () => {
    switch (step) {
      case 1:
        return "Basics";
      case 2:
        return "Units";
      case 3:
        return "Media";
      case 4:
        return "Team";
      case 5:
        return "Charges";
      case 6:
        return "Review";
      default:
        return "";
    }
  };

  const goToNext = async () => {
    let valid = false;
    if (step === 1) {
      valid = await trigger([
        "name",
        "address",
        "city",
        "property_type",
        "config",
      ]);
    } else if (step === 2) {
      // Unit creation is optional - skip validation
      valid = true;
    } else if (step === 3) {
      valid = await trigger(["photos", "documents"]);
    } else if (step === 4) {
      valid = await trigger([
        "owner_ids",
        "agent_ids",
        "new_owners",
        "new_caretakers",
      ]);
    } else if (step === 5) {
      // Charges are optional
      valid = true;
    }

    if (valid) setStep((s) => s + 1);
    else {
      console.warn(
        "Validation failed for step",
        step,
        methods.formState.errors,
      );
      const errs = methods.formState.errors;
      const firstError = Object.values(errs)[0] as FieldError | undefined;
      if (firstError) {
        const message = firstError.message || "Please fix validation errors.";
        toast.error(message);
      }
    }
  };

  const goToBack = () => {
    if (step === 1) router.back();
    else setStep((s) => s - 1);
  };

  const handleFormSubmit = async (values: PropertyFormValues) => {
    setSubmitError(null);

    // Unit creation is optional - no validation required

    try {
      // 1. Invite new owners first
      const newOwnerIds: string[] = [];
      for (const owner of values.new_owners) {
        const res = await fetch("/api/proxy/api/v1/owners/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: owner.first_name,
            last_name: owner.last_name,
            email: owner.email,
            phone: owner.phone || undefined,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.message ?? `Failed to invite owner ${owner.email}`,
          );
        }
        const data = await res.json();
        if (data?.id) newOwnerIds.push(data.id);
      }

      // 2. Format config based on type
      const c = values.config as Record<string, unknown>;
      let config: Record<string, unknown> = { type: "single_family" };
      if (values.property_type === "multifamily") {
        config = {
          type: "multifamily",
          floors: c.floors ?? 1,
          parking_spaces: c.parking_spaces ?? 0,
        };
      } else if (values.property_type === "commercial") {
        config = {
          type: "commercial",
          cam_rate: c.cam_rate ?? 0,
          building_class: c.building_class ?? "B",
        };
      } else if (values.property_type === "community") {
        config = {
          type: "community_association",
          due_billing_cycle: c.due_billing_cycle ?? "Monthly",
          board_seats: c.board_seats ?? 3,
        };
      } else if (values.property_type === "student") {
        config = {
          type: "student_housing",
          campus_proximity_km: c.campus_proximity_km ?? 1,
          semester_start_month: c.semester_start_month ?? 9,
        };
      } else if (values.property_type === "affordable_housing") {
        config = {
          type: "affordable_housing",
          program_id: c.program_id ?? "",
          ami_percentage: c.ami_percentage ?? 60,
        };
      }

      // 3. Create property
      const property = (await createProperty.mutateAsync({
        ...values,
        config,
        owner_ids: [...values.owner_ids, ...newOwnerIds],
        new_caretakers: values.new_caretakers.map((ct) => ({
          ...ct,
          email: ct.email || undefined,
          phone: ct.phone || undefined,
        })),
        portal_base_url: window.location.origin,
        agency_name: "Emakao",
        policies: values.policies,
      } as unknown as CreatePropertyDto)) as { id: string; slug: string };

      router.push(`/${agencySlug}/properties/${property.slug}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  return (
    <FormProvider {...methods}>
      <GuidedCreateShell
        title="Create Property"
        description="Register a new asset to your portfolio."
        steps={STEPS}
        currentStep={step}
        onBack={goToBack}
        aside={<SummaryAside progressLabel={getProgressLabel()} />}
      >
        <div className="space-y-6">
          {step === 1 && <BasicsStep onNext={goToNext} />}
          {step === 2 && <UnitsStep onNext={goToNext} onBack={goToBack} />}
          {step === 3 && (
            <MediaStep
              onNext={goToNext}
              onBack={goToBack}
              keyToUrl={keyToUrl}
              setKeyToUrl={setKeyToUrl}
            />
          )}
          {step === 4 && <TeamStep onNext={goToNext} onBack={goToBack} />}
          {step === 5 && (
            <div className="space-y-6">
              <StepHeader
                icon={() => <span>💰</span>}
                title="Service Charges"
                description="Configure service charges for the property"
              />
              <ServiceChargesStep />
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  size="lg"
                  onClick={goToNext}
                  className="rounded-xl px-8 shadow-lg shadow-primary/20"
                >
                  Next: Review
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}
          {step === 6 && (
            <ReviewStep
              onBack={goToBack}
              onSubmit={handleSubmit(handleFormSubmit, (err) => {
                console.error("Validation errors:", err);
                setSubmitError("Please fix the errors before submitting.");
              })}
              isPending={createProperty.isPending || isSubmitting}
              submitError={submitError}
            />
          )}
        </div>
      </GuidedCreateShell>
    </FormProvider>
  );
}

// Import missing components
import { StepHeader } from "@/components/properties/step-header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ServiceChargesStep() {
  const { control, watch } = useFormContext<PropertyFormValues>();
  const serviceChargesEnabled = watch("policies.service_charges.enabled");

  return (
    <Card className="border border-dashed bg-muted/30">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Controller
              name="policies.service_charges.enabled"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="enable_service_charges"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            <Label htmlFor="enable_service_charges">
              Enable Service Charges
            </Label>
          </div>

          {serviceChargesEnabled && (
            <div className="grid gap-4 pt-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="security_fee">Security Fee (KES)</Label>
                <Controller
                  name="policies.service_charges.security_fee_kes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="security_fee"
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="water_rate">Water Rate (per unit, KES)</Label>
                <Controller
                  name="policies.service_charges.water_rate_per_unit"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="water_rate"
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="garbage_fee">Garbage Fee (KES)</Label>
                <Controller
                  name="policies.service_charges.garbage_fee_kes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="garbage_fee"
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="electricity_common">
                  Electricity Common (KES)
                </Label>
                <Controller
                  name="policies.service_charges.electricity_common_kes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="electricity_common"
                      type="number"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
