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
  { id: 5, title: "Review", description: "Finalize" },
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
